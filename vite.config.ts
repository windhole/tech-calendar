import { copyFileSync, existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { buildEventsIcs } from './src/events/ical';
import { parseEventsYaml } from './src/events/parseEventsYaml';
import { mergeEventLayers } from './src/utils/mergeEvents';

const EVENT_YAML_NAME = /^events.*\.yaml$/;
const EVENT_YAML_VIRTUAL = 'virtual:event-yaml-sources';
const EVENT_YAML_RESOLVED = `\0${EVENT_YAML_VIRTUAL}`;

function listEventYamlSources(root: string): { name: string; mtimeMs: number }[] {
  const dir = path.join(root, 'public');
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir)
    .filter((name) => EVENT_YAML_NAME.test(name))
    .map((name) => ({
      name,
      mtimeMs: statSync(path.join(dir, name)).mtimeMs,
    }))
    .sort((a, b) => a.mtimeMs - b.mtimeMs || a.name.localeCompare(b.name));
}

function eventYamlSourcesPlugin(): Plugin {
  let root = process.cwd();

  return {
    name: 'event-yaml-sources',
    configResolved(config) {
      root = config.root;
    },
    resolveId(id) {
      if (id === EVENT_YAML_VIRTUAL) {
        return EVENT_YAML_RESOLVED;
      }
    },
    load(id) {
      if (id !== EVENT_YAML_RESOLVED) {
        return;
      }

      const files = listEventYamlSources(root);
      for (const file of files) {
        this.addWatchFile(path.join(root, 'public', file.name));
      }
      return `export const eventYamlSources = ${JSON.stringify(files)};\n`;
    },
    configureServer(server) {
      server.watcher.add(path.join(root, 'public'));
      const invalidate = (file: string) => {
        if (!EVENT_YAML_NAME.test(path.basename(file))) {
          return;
        }
        const mod = server.moduleGraph.getModuleById(EVENT_YAML_RESOLVED);
        if (mod) {
          void server.reloadModule(mod);
        }
      };
      server.watcher.on('add', invalidate);
      server.watcher.on('unlink', invalidate);
      server.watcher.on('change', invalidate);
    },
  };
}

const EVENTS_ICS_NAME = 'events.ics';

/** public/ の events*.yaml を、アプリと同じ順（古いファイルから）で合成して ICS にする */
function renderEventsIcs(root: string): string {
  const layers = listEventYamlSources(root).map((file) =>
    parseEventsYaml(readFileSync(path.join(root, 'public', file.name), 'utf8'), file.name)
  );
  return buildEventsIcs(mergeEventLayers(layers), {
    calendarName: "windhole's tech calendar",
    generatedAt: new Date(),
    uidDomain: 'windhole.github.io',
  });
}

/** カレンダーアプリから購読できるように、ビルド時に dist/events.ics を書き出す */
function eventsIcsPlugin(): Plugin {
  let root = process.cwd();
  let base = '/';

  return {
    name: 'events-ics',
    configResolved(config) {
      root = config.root;
      base = config.base;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] !== `${base}${EVENTS_ICS_NAME}`) {
          next();
          return;
        }
        res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
        res.end(renderEventsIcs(root));
      });
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: EVENTS_ICS_NAME,
        source: renderEventsIcs(root),
      });
    },
  };
}

function githubPagesSpaFallback(): Plugin {
  return {
    name: 'github-pages-spa-fallback',
    closeBundle() {
      const index = path.resolve(__dirname, 'dist/index.html');
      const fallback = path.resolve(__dirname, 'dist/404.html');
      if (existsSync(index)) {
        copyFileSync(index, fallback);
      }
    },
  };
}

export default defineConfig({
  base: '/tech-calendar/',
  plugins: [react(), eventYamlSourcesPlugin(), eventsIcsPlugin(), githubPagesSpaFallback()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
