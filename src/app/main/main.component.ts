import { Component, OnInit } from '@angular/core';
import { FirebaseService } from "../firebase.service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor(private firebaseService: FirebaseService) { }

  posts: any;

  ngOnInit() {
    this.posts = this.firebaseService.getPosts();
  }

}
