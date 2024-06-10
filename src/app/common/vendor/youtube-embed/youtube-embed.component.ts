import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { FieldType } from '@ngx-formly/material';
import { SharedService } from '@wfm/service-layer';

@Component({
  selector: 'app-youtube-embed',
  templateUrl: './youtube-embed.component.html',
  styleUrls: ['./youtube-embed.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class YoutubeEmbedComponent extends FieldType implements OnInit {
  showInput: boolean = false;
  safeResourceUrl: SafeResourceUrl;
  showVideoPreview: boolean = false;

  constructor(private sharedService: SharedService) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
    if (this.field?.defaultValue) {
      this.safeResourceUrl = this.sharedService.getSanitizedYtVideoUrl(this.field.defaultValue);
      this.showVideoPreview = true;
    }

    this.formControl.valueChanges.subscribe((x) => {
      if (this.formControl.valid) {
        this.safeResourceUrl = this.sharedService.getSanitizedYtVideoUrl(x);
      }
    });
  }

  toogleViewEditMode(): void {
    this.showVideoPreview = !this.showVideoPreview;
  }
}
