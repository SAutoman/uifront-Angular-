import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NotificationTopicDto, TopicKindEnum, TopicKindNameMap } from '@wfm/service-layer/services/notification-topic.service';
import { UnsubscribeEmailService } from '@wfm/service-layer/services/unsubscribe-email.service';

@Component({
  selector: 'app-email-unsubscribe-callback',
  templateUrl: './email-unsubscribe-callback.component.html',
  styleUrls: ['./email-unsubscribe-callback.component.scss']
})
export class EmailUnsubscribeCallbackComponent implements OnInit {
  hash: string;
  notification: NotificationTopicDto;
  form: FormGroup;
  notificationType: string;
  error: string;
  constructor(private unsubscribeEmailService: UnsubscribeEmailService, private activatedRoute: ActivatedRoute) {}

  async ngOnInit(): Promise<void> {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    });

    this.hash = this.activatedRoute.snapshot.queryParams['hash'];
    await this.getNotificationTopic();
  }

  async getNotificationTopic(): Promise<void> {
    try {
      this.notification = await this.unsubscribeEmailService.getNotificationTopic(this.hash);
    } catch (error) {
      this.error = error.message || error;
    }

    this.notificationType = TopicKindNameMap.get(this.notification.topicKind).viewValue;
  }

  async unsubscribeFromNotification(): Promise<void> {
    try {
      const email = this.form.value['email'];
      await this.unsubscribeEmailService.unsubscribeUserEmail(this.hash, email);
    } catch (error) {}
  }
}
