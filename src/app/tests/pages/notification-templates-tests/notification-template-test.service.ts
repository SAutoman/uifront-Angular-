import { Injectable } from '@angular/core';
import { BeckerCasesTemplate } from '@wfm/notification-templates/becker-case-template-file';
import { BeckerInvitationsTemplate } from '@wfm/notification-templates/becker-invitation-template-file';
import { BeckerNewRawDataTemplate } from '@wfm/notification-templates/becker-raw-data-template-file';
import { GDCCasesTemplate } from '@wfm/notification-templates/gdc-case-template-file';
import { GDCInvitationsTemplate } from '@wfm/notification-templates/gdc-invitation-template-file';
import { GDCNewRawDataTemplate } from '@wfm/notification-templates/gdc-raw-data-template-file';
import { PorscheCasesTemplate } from '@wfm/notification-templates/porsche-case-template-file';
import { PorscheInvitationsTemplate } from '@wfm/notification-templates/porsche-invitation-template-file';
import { PorscheNewRawDataTemplate } from '@wfm/notification-templates/porsche-raw-data-template-file';
import {
  CreateNotificationTemplateCommand,
  GetNotificationTemplateQuery,
  DeleteNotificationTemplateCommand
} from '@wfm/service-layer/models/notificationTemplate';
import { NotificationTemplateService } from '@wfm/service-layer/services/notification-template.service';
import { TestResult } from '@wfm/tests/models';
import { ITestService, TestContext } from '../app-tests/create-app-test.service';

export class NotificationTemplateTestService implements ITestService {
  protected ctx: TestContext;
  protected templateId: string;

  constructor(protected notificationTemplateService: NotificationTemplateService) {}
  async initialize(ctx: TestContext): Promise<void> {
    this.ctx = ctx;

    const command = <CreateNotificationTemplateCommand>{
      name: 'testNotificationTemplateCreation',
      template: 'testTemplateTemplate',
      tenantId: this.ctx.tenantId
    };

    const operation = await this.notificationTemplateService.create(command);
    this.templateId = operation.targetId;
  }
  async test(): Promise<TestResult> {
    throw new Error('This method is not implemented.');
  }
  async cleanup(): Promise<void> {
    await this.notificationTemplateService.delete(<DeleteNotificationTemplateCommand>{
      id: this.templateId,
      tenantId: this.ctx.tenantId
    });
  }
}

@Injectable()
export class CreateNotificationTemplateTestService extends NotificationTemplateTestService {
  constructor(notificationTemplateService: NotificationTemplateService) {
    super(notificationTemplateService);
  }
  async test(): Promise<TestResult> {
    const result = await this.notificationTemplateService.get(<GetNotificationTemplateQuery>{
      tenantId: this.ctx.tenantId,
      id: this.templateId
    });

    if (result.name == 'testNotificationTemplateCreation') {
      return TestResult.success();
    }
    return TestResult.failure('Test failed.');
  }
}

@Injectable()
export class GetNotificationTemplateTestService extends NotificationTemplateTestService {
  constructor(notificationTemplateService: NotificationTemplateService) {
    super(notificationTemplateService);
  }
  async test(): Promise<TestResult> {
    const notificationTemplateEntity = await this.notificationTemplateService.get({ id: this.templateId, tenantId: this.ctx.tenantId });

    if (this.templateId == notificationTemplateEntity.id) {
      return TestResult.success();
    }

    return TestResult.failure('Test failed.');
  }
}

@Injectable()
export class UpdateNotificationTemplateTestService extends NotificationTemplateTestService {
  constructor(notificationTemplateService: NotificationTemplateService) {
    super(notificationTemplateService);
  }
  async test(): Promise<TestResult> {
    const updateOperation = await this.notificationTemplateService.update({
      id: this.templateId,
      name: 'updateTest',
      logoId: '',
      template: 'testUpdateTemplate',
      tenantId: this.ctx.tenantId
    });

    const updatedNotificationTemplate = await this.notificationTemplateService.get({
      id: updateOperation.targetId,
      tenantId: this.ctx.tenantId
    });

    if (updatedNotificationTemplate.name === 'updateTest') {
      return TestResult.success();
    }
    return TestResult.failure('Test failed.');
  }
}

@Injectable()
export class SearchNotificationTemplateTestService extends NotificationTemplateTestService {
  constructor(notificationTemplateService: NotificationTemplateService) {
    super(notificationTemplateService);
  }
  async test(): Promise<TestResult> {
    const searchOperation = await this.notificationTemplateService.search(this.ctx.tenantId, {});

    if (searchOperation.items.some((x) => x.name === 'testNotificationTemplateCreation')) {
      return TestResult.success();
    }
    return TestResult.failure('Test failed.');
  }
}

@Injectable()
export class DeleteNotificationTemplateTestService extends NotificationTemplateTestService {
  constructor(notificationTemplateService: NotificationTemplateService) {
    super(notificationTemplateService);
  }
  async test(): Promise<TestResult> {
    await this.notificationTemplateService.delete(<DeleteNotificationTemplateCommand>{
      id: this.templateId,
      tenantId: this.ctx.tenantId
    });

    return TestResult.success();
  }
  async cleanup(): Promise<void> {}
}

@Injectable()
export class SeedGDCRawDataTemplateTestService implements ITestService {
  private ctx: TestContext;

  constructor(private notificationTemplateService: NotificationTemplateService) {}
  async initialize(ctx: TestContext): Promise<void> {
    this.ctx = ctx;

    const command = <CreateNotificationTemplateCommand>{
      name: 'New Articles',
      template: GDCNewRawDataTemplate,
      tenantId: this.ctx.tenantId
    };

    const operation = await this.notificationTemplateService.createOrUpdate(command);

    const command2 = <CreateNotificationTemplateCommand>{
      name: 'Not processed articles',
      template: GDCNewRawDataTemplate,
      tenantId: this.ctx.tenantId
    };

    const operation2 = await this.notificationTemplateService.createOrUpdate(command2);
  }
  async test(): Promise<TestResult> {
    return TestResult.success();
  }
  async cleanup(): Promise<void> {}
}

@Injectable()
export class SeedGDCCasesTemplateTestService implements ITestService {
  protected ctx: TestContext;

  constructor(protected notificationTemplateService: NotificationTemplateService) {}
  async initialize(ctx: TestContext): Promise<void> {
    this.ctx = ctx;

    const command = <CreateNotificationTemplateCommand>{
      name: 'New cases',
      template: GDCCasesTemplate,
      tenantId: this.ctx.tenantId
    };

    const operation = await this.notificationTemplateService.createOrUpdate(command);

    const command2 = <CreateNotificationTemplateCommand>{
      name: 'Not processed cases',
      template: GDCCasesTemplate,
      tenantId: this.ctx.tenantId
    };

    const operation2 = await this.notificationTemplateService.createOrUpdate(command2);

    const command3 = <CreateNotificationTemplateCommand>{
      name: 'Case delayed (in progress )',
      template: GDCCasesTemplate,
      tenantId: this.ctx.tenantId
    };

    const operation3 = await this.notificationTemplateService.createOrUpdate(command3);
  }
  async test(): Promise<TestResult> {
    return TestResult.success();
  }
  async cleanup(): Promise<void> {}
}

@Injectable()
export class SeedGDCInvitationsTemplateTestService implements ITestService {
  private ctx: TestContext;

  constructor(private notificationTemplateService: NotificationTemplateService) {}
  async initialize(ctx: TestContext): Promise<void> {
    this.ctx = ctx;

    const command = <CreateNotificationTemplateCommand>{
      name: 'Invitation',
      template: GDCInvitationsTemplate,
      tenantId: this.ctx.tenantId
    };

    const operation = await this.notificationTemplateService.createOrUpdate(command);
  }
  async test(): Promise<TestResult> {
    return TestResult.success();
  }
  async cleanup(): Promise<void> {}
}

@Injectable()
export class SeedBeckerRawDataTemplateTestService implements ITestService {
  private ctx: TestContext;

  constructor(private notificationTemplateService: NotificationTemplateService) {}
  async initialize(ctx: TestContext): Promise<void> {
    this.ctx = ctx;

    const command = <CreateNotificationTemplateCommand>{
      name: '(Becker) New Articles',
      template: BeckerNewRawDataTemplate,
      tenantId: this.ctx.tenantId
    };

    const operation = await this.notificationTemplateService.createOrUpdate(command);

    const command2 = <CreateNotificationTemplateCommand>{
      name: '(Becker) Not processed articles',
      template: BeckerNewRawDataTemplate,
      tenantId: this.ctx.tenantId
    };

    const operation2 = await this.notificationTemplateService.createOrUpdate(command2);
  }
  async test(): Promise<TestResult> {
    return TestResult.success();
  }
  async cleanup(): Promise<void> {}
}

@Injectable()
export class SeedBeckerCasesTemplateTestService implements ITestService {
  protected ctx: TestContext;

  constructor(protected notificationTemplateService: NotificationTemplateService) {}
  async initialize(ctx: TestContext): Promise<void> {
    this.ctx = ctx;

    const command = <CreateNotificationTemplateCommand>{
      name: '(Becker) New cases',
      template: BeckerCasesTemplate,
      tenantId: this.ctx.tenantId
    };

    const operation = await this.notificationTemplateService.createOrUpdate(command);

    const command2 = <CreateNotificationTemplateCommand>{
      name: '(Becker) Not processed cases',
      template: BeckerCasesTemplate,
      tenantId: this.ctx.tenantId
    };

    const operation2 = await this.notificationTemplateService.createOrUpdate(command2);

    const command3 = <CreateNotificationTemplateCommand>{
      name: '(Becker) Case delayed (in progress )',
      template: BeckerCasesTemplate,
      tenantId: this.ctx.tenantId
    };

    const operation3 = await this.notificationTemplateService.createOrUpdate(command3);
  }
  async test(): Promise<TestResult> {
    return TestResult.success();
  }
  async cleanup(): Promise<void> {}
}

@Injectable()
export class SeedBeckerInvitationsTemplateTestService implements ITestService {
  private ctx: TestContext;

  constructor(private notificationTemplateService: NotificationTemplateService) {}
  async initialize(ctx: TestContext): Promise<void> {
    this.ctx = ctx;

    const command = <CreateNotificationTemplateCommand>{
      name: '(Becker) Invitation',
      template: BeckerInvitationsTemplate,
      tenantId: this.ctx.tenantId
    };

    const operation = await this.notificationTemplateService.createOrUpdate(command);
  }
  async test(): Promise<TestResult> {
    return TestResult.success();
  }
  async cleanup(): Promise<void> {}
}

@Injectable()
export class SeedPorscheRawDataTemplateTestService implements ITestService {
  private ctx: TestContext;

  constructor(private notificationTemplateService: NotificationTemplateService) {}
  async initialize(ctx: TestContext): Promise<void> {
    this.ctx = ctx;

    const command = <CreateNotificationTemplateCommand>{
      name: '(Porsche) New Articles',
      template: PorscheNewRawDataTemplate,
      tenantId: this.ctx.tenantId
    };

    const operation = await this.notificationTemplateService.createOrUpdate(command);

    const command2 = <CreateNotificationTemplateCommand>{
      name: '(Porsche) Not processed articles',
      template: PorscheNewRawDataTemplate,
      tenantId: this.ctx.tenantId
    };

    const operation2 = await this.notificationTemplateService.createOrUpdate(command2);
  }
  async test(): Promise<TestResult> {
    return TestResult.success();
  }
  async cleanup(): Promise<void> {}
}

@Injectable()
export class SeedPorscheCasesTemplateTestService implements ITestService {
  protected ctx: TestContext;

  constructor(protected notificationTemplateService: NotificationTemplateService) {}
  async initialize(ctx: TestContext): Promise<void> {
    this.ctx = ctx;

    const command = <CreateNotificationTemplateCommand>{
      name: '(Porsche) New cases',
      template: PorscheCasesTemplate,
      tenantId: this.ctx.tenantId
    };

    const operation = await this.notificationTemplateService.createOrUpdate(command);

    const command2 = <CreateNotificationTemplateCommand>{
      name: '(Porsche) Not processed cases',
      template: PorscheCasesTemplate,
      tenantId: this.ctx.tenantId
    };

    const operation2 = await this.notificationTemplateService.createOrUpdate(command2);

    const command3 = <CreateNotificationTemplateCommand>{
      name: '(Porsche) Case delayed (in progress )',
      template: PorscheCasesTemplate,
      tenantId: this.ctx.tenantId
    };

    const operation3 = await this.notificationTemplateService.createOrUpdate(command3);
  }
  async test(): Promise<TestResult> {
    return TestResult.success();
  }
  async cleanup(): Promise<void> {}
}

@Injectable()
export class SeedPorscheInvitationsTemplateTestService implements ITestService {
  private ctx: TestContext;

  constructor(private notificationTemplateService: NotificationTemplateService) {}
  async initialize(ctx: TestContext): Promise<void> {
    this.ctx = ctx;

    const command = <CreateNotificationTemplateCommand>{
      name: '(Porsche) Invitation',
      template: PorscheInvitationsTemplate,
      tenantId: this.ctx.tenantId
    };

    const operation = await this.notificationTemplateService.createOrUpdate(command);
  }
  async test(): Promise<TestResult> {
    return TestResult.success();
  }
  async cleanup(): Promise<void> {}
}
