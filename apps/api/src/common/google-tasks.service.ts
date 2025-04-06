import { Injectable } from '@nestjs/common';
import { CloudTasksClient, protos } from '@google-cloud/tasks';

@Injectable()
export class GoogleTasksService {
  private client = new CloudTasksClient();
  private project = 'your-project-id';
  private location = 'us-central1';
  private queue = 'my-queue';
  private url = 'https://your-fastapi-worker.com/task-handler';

  async addTask(data: any): Promise<protos.google.cloud.tasks.v2.ITask> {
    const parent = this.client.queuePath(
      this.project,
      this.location,
      this.queue,
    );

    const task = {
      httpRequest: {
        httpMethod: protos.google.cloud.tasks.v2.HttpMethod.POST,
        url: this.url,
        headers: {
          'Content-Type': 'application/json',
        },
        body: Buffer.from(JSON.stringify(data)).toString('base64'),
      },
    };

    const response = await this.client.createTask({ parent, task });
    return response[0];
  }
}
