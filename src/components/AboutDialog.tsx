import aboutMarkdown from '../../about.md?raw';
import { MarkdownDoc } from '@/components/MarkdownDoc';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>About</DialogTitle>
          <DialogDescription className="sr-only">
            windhole&apos;s tech calendar について
          </DialogDescription>
        </DialogHeader>
        <MarkdownDoc source={aboutMarkdown} className="about-markdown" />
      </DialogContent>
    </Dialog>
  );
}
