import { Component, OnInit } from '@angular/core';
import { FirebaseService } from "../firebase.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FormGroup, FormControl, Validators } from "@angular/forms";

import {Post} from "../models/Post";


@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  constructor(private firebaseService: FirebaseService, private route: ActivatedRoute, private router: Router ) { }

  public currentPost: Post;
  public currentId: any = this.route.snapshot.paramMap.get("id");
  public editMode: boolean = false;
  public postTags: any;
  public tags: any[];
  public activeTags: any[] = [];
  public notActiveTags: any[] = [];
  public image: any;
  public busy: boolean;


  public editForm = new FormGroup({
    title: new FormControl('', Validators.required),
    content: new FormControl('',  Validators.required),
    oldcover: new FormControl('', Validators.required),
    addTags: new FormControl('', Validators.required),
    removeTags: new FormControl('', Validators.required)
  });


  public async getPost(){
    this.currentPost = await this.firebaseService.getPost(this.currentId);
    //get tags 
    //console.log(this.currentPost["tags"])
    this.postTags = await this.firebaseService.getTagsName(this.currentPost["tags"]);
    //console.log(this.postTags)

    this.postTags.map(t => {
      if(t["status"] == true){
        this.activeTags.push(t);
      }else{
        this.notActiveTags.push(t);
      }
    })

    
    this.editForm.setValue({
      title: this.currentPost.title,
      content: this.currentPost.content,
      oldcover: this.currentPost.cover,
      addTags:[],
      removeTags: []
    })

  }

  public handleInput($event: Event){
    //getting the image or files
    this.image = $event.target["files"];
    console.log(this.image);
  }

  public enableEdit(){
    this.editMode = !this.editMode;
  }


  public async editPost(formData: Post) {
    this.busy = true;
    formData["tags"] = this.currentPost.tags;
    formData["fileref"] = this.currentPost.fileref;
    await this.firebaseService.editPost(formData, this.image, this.currentId);
    this.busy = false;
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(()=>
    this.router.navigate(["/post", this.currentId])); 
  }


  public async deletePost(postId: string){
    await this.firebaseService.deletePost(postId, this.currentPost.fileref);
    this.router.navigate(["/"]);
  }


  ngOnInit() {
    this.getPost();
    this.firebaseService.getAllTags().then(tags => {
      this.tags = tags;
    })
  }

}
