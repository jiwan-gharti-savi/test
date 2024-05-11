// UpdateMermaidQueue.js
export class UpdateMermaidQueue {
    constructor(processFunction) {
      this.queue = [];
      this.isProcessing = false;
      this.processFunction = processFunction; // Function to process each item
    }
  
    addTask(task) {
      return new Promise((resolve) => {
        this.queue.push({ ...task, resolve });
        if (!this.isProcessing) {
          this.processQueue();
        }
      });
    }
  
    async processQueue() {
      this.isProcessing = true;
      while (this.queue.length > 0) {
        const task = this.queue.shift();
        await this.processFunction(task); // Process the task
        task.resolve(); // Mark the task as done
        await new Promise((r) => setTimeout(r, 100)); // Delay between tasks
      }
      this.isProcessing = false;
    }
  }
  