import { Injectable } from '@nestjs/common';
import { CloudTasksClient, protos } from '@google-cloud/tasks';

@Injectable()
export class GoogleTasksService {
  private client = new CloudTasksClient({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
      client_email: process.env.GCP_CLIENT_EMAIL,
      private_key: process.env.GCP_PRIVATE_KEY,
    },
  });
  private project = 'intervuave';
  private location = 'asia-east2';
  private queue = 'interview-processing';
  private url =
    'https://jethrob123-processing-worker.hf.space/process-interview';

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
