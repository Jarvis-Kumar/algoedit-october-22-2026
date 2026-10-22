
import { AutomationTask, WorkflowMacro, BrandStyle, User } from '../types';

export class AutomationService {
  private static MACROS_KEY = 'ai-studio-macros';
  private static BRAND_STYLES_KEY = 'ai-studio-brand-styles';

  static getMacros(): WorkflowMacro[] {
    const stored = localStorage.getItem(this.MACROS_KEY);
    return stored ? JSON.parse(stored) : [
      {
        id: 'macro-1',
        name: 'Social Media Quick-Cut',
        description: 'Remove silence, add captions, and reframe for vertical.',
        steps: ['silence-removal', 'captioning', 'reframing'],
        createdAt: Date.now()
      },
      {
        id: 'macro-2',
        name: 'Pro Polish',
        description: 'Apply face smoothing, eye contact correction, and lighting fix.',
        steps: ['face-smoothing', 'eye-contact'],
        createdAt: Date.now()
      }
    ];
  }

  static saveMacro(macro: WorkflowMacro) {
    const macros = this.getMacros();
    macros.push(macro);
    localStorage.setItem(this.MACROS_KEY, JSON.stringify(macros));
  }

  static getBrandStyles(): BrandStyle[] {
    const stored = localStorage.getItem(this.BRAND_STYLES_KEY);
    return stored ? JSON.parse(stored) : [
      {
        id: 'brand-1',
        name: 'Synthetix Default',
        colors: ['#06b6d4', '#8b5cf6', '#000000'],
        typography: 'Inter',
        layoutStyle: 'Minimalist'
      }
    ];
  }

  static saveBrandStyle(style: BrandStyle) {
    const styles = this.getBrandStyles();
    styles.push(style);
    localStorage.setItem(this.BRAND_STYLES_KEY, JSON.stringify(styles));
  }

  static async runWorkflow(steps: AutomationTask['type'][], onProgress: (step: string, progress: number) => void) {
    for (const step of steps) {
      onProgress(step, 0);
      // Simulate step processing
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 300));
        onProgress(step, i);
      }
    }
  }

  static suggestAutomations(history: string[]): string | null {
    // Basic pattern detection
    const counts: Record<string, number> = {};
    history.forEach(h => counts[h] = (counts[h] || 0) + 1);
    
    for (const [action, count] of Object.entries(counts)) {
      if (count > 3) {
        return `You've performed "${action}" ${count} times. Want to create an automation macro?`;
      }
    }
    return null;
  }

  static getCopilotSuggestions(context: any): string[] {
    const suggestions = [];
    if (!context.hasCaptions) suggestions.push("Add dynamic captions to increase engagement by 40%.");
    if (context.lighting < 50) suggestions.push("Lighting seems low. Apply 'AI Lighting Fix'?");
    if (context.duration > 60) suggestions.push("Video is long for social. Try 'Auto Shorts' to cut highlights.");
    return suggestions;
  }
}
