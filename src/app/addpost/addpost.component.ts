import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { FirebaseService } from "../firebase.service";
import { Post } from "../models/Post";


@Component({
  selector: 'app-addpost',
  templateUrl: './addpost.component.html',
  styleUrls: ['./addpost.component.css']
})
export class AddpostComponent implements OnInit {

  constructor(private firebaseService: FirebaseService, private router: Router) { }

  public tags : any[] = [];
  public image : any;
  public percentage: any = this.firebaseService.percentage;
  public postForm = new FormGroup({
    title: new FormControl('', Validators.required),
    content: new FormControl('',  Validators.required),
    cover: new FormControl('',  Validators.required),  
    tags: new FormControl('', Validators.required)
  });

  public handleInput($event: Event){
    //getting the image or files
    this.image = $event.target["files"];
    console.log(this.image);
  }

  public async addPost(formData: Post){
    await this.firebaseService.addPost(formData, this.image);
    this.router.navigate(["/"]);
  }


  ngOnInit() {
    this.firebaseService.getAllTags().then(tags => {
      console.log(tags);
      this.tags = tags;
      
    });

    this.firebaseService.percentageChanges.subscribe( x => this.percentage = x);

    
    


  }

}
