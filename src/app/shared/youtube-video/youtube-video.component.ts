import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SafeResourceUrl } from '@angular/platform-browser';
import { SharedService } from '@wfm/service-layer';

@Component({
  selector: 'app-youtube-video',
  templateUrl: './youtube-video.component.html',
  styleUrls: ['./youtube-video.component.scss']
})
export class YoutubeVideoComponent implements OnInit {
  safeResourceUrl: SafeResourceUrl;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { embedUrl: string }, private sharedService: SharedService) {}

  ngOnInit(): void {
    const embedUrl: string = this.data?.embedUrl;
    this.safeResourceUrl = this.sharedService.getSanitizedYtVideoUrl(embedUrl, true);
  }
}
