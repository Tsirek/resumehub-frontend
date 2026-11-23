// Последовательная запись: старый запрос никогда не обгоняет новые правки.
export class SaveQueue<T> {
  private pending: T | undefined;
  private running: Promise<void> | null = null;
  private failure: unknown;
  private save: (value: T) => Promise<void>;
  constructor(save: (value: T) => Promise<void>) { this.save = save; }
  enqueue(value: T): void { this.pending = value; }
  async flush(): Promise<void> {
    if (this.running) { await this.running; return this.flush(); }
    if (this.pending === undefined) return;
    this.failure = undefined;
    this.running = (async () => {
      while (this.pending !== undefined) {
        const value = this.pending;
        this.pending = undefined;
        try { await this.save(value); }
        catch (error) {
          if (this.pending === undefined) this.pending = value;
          this.failure = error;
          throw error;
        }
      }
    })();
    try { await this.running; } finally { this.running = null; }
  }
  get dirty(): boolean { return this.pending !== undefined || this.running !== null || this.failure !== undefined; }
}
