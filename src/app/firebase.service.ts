import { Injectable } from '@angular/core';
import { AngularFirestore} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import {Router} from "@angular/router";
import {Observable} from "rxjs";
import {BehaviorSubject} from "rxjs";
import { map, take} from 'rxjs/operators';
import { Post } from "./models/Post";

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private router: Router) { }
    
    filepath: any;
    uploadPercent: Observable<number>;
    downloadURL: Observable<string>;
    public percentage: any;
    public percentageChanges: BehaviorSubject<any> = new BehaviorSubject<any>(this.percentage);

    setPercentage(percent: any): void{
      this.percentage = percent;
      this.percentageChanges.next(percent);
    }


    //get all tags
    public async getAllTags(){

      let tags = [];
      await new Promise((resolve) => {
      
      this.firestore.collection("Tags").snapshotChanges().pipe(
          take(1),
          map(changes => {
            let _tags = [];
            changes.forEach(t => {
              _tags.push({id: t["payload"]["doc"]["id"], ...t["payload"]["doc"].data()}) 
            });
           
            return _tags;
          })
          ).subscribe(_tags => {
            resolve();
            return tags = _tags;
          });
      })
      .then(() => {
        console.log("Tags fetched successfully");
      }).catch(err => {
        console.log("Whoops! ----> ", err)
      });

      console.log(tags);
      return tags;

    }

    public async uploadImage(files: any[]){
      const image = files[0];
      this.filepath = Date.now() + "-" + files[0]["name"];
    
      //get the reference
      const fileRef = this.storage.ref(this.filepath);
      const task = this.storage.upload(this.filepath, image);

      //get the percentage
      this.uploadPercent = task.percentageChanges();
      
      //subscribe to the percentage
      this.uploadPercent.subscribe(percent => {
        console.log("x", percent);
        this.setPercentage(Math.trunc(percent));
      });

      let upload = await task.snapshotChanges().toPromise();
      this.downloadURL = await fileRef.getDownloadURL().toPromise();
    }


    public async getTagsName(tagsArray: any[]){
      let currentTags = tagsArray;
      let allTags = [];
      //get all the tags
      await new Promise((resolve) => {
        this.firestore.collection("Tags", ref => ref.orderBy("name")).snapshotChanges().pipe(
          take(1),
          map(changes =>{
            let _tags = [];
            changes.forEach(t => {
              if(currentTags.includes(t.payload.doc.id)){
                _tags.push({id: t.payload.doc.id, ...t.payload.doc.data(), status: true})
              }else{
                _tags.push({id: t.payload.doc.id, ...t.payload.doc.data(), status: false})
              }
            });
            return _tags;
          })
          ).subscribe(tags => {
            resolve();
            return allTags = tags;
        }); 
      });
      //console.log(allTags)
      return allTags;
    }


    //get all posts
    public getPosts(){
     
      let posts = this.firestore.collection("posts").snapshotChanges();
      return posts.pipe(
        map(p => {
          let posts = [];
          p.forEach(p => {
            posts.push(p);
          });
          return posts;
        })
      )
      
    }


    //get post by id
    public async getPost(docId: string){
      let currentPost: any;
      await new Promise((resolve) => {
        this.firestore.collection("posts").doc(docId).valueChanges().pipe(
          take(1),
          map(post => {
            console.log(post);
            currentPost = post;
            return currentPost;
          })
          
        ).subscribe(() => {
          resolve();
        });
      }).catch(err => {
        console.log(err);
      })
      return currentPost;
    }


    //create a new post
    public async addPost(postObj: Post, files: any[]){

      await this.uploadImage(files);

      let newpost = {
        title : postObj["title"],
        content : postObj["content"],
        cover: this.downloadURL,
        fileref: this.filepath,
        tags: postObj["tags"]
      }

      let p = await this.firestore.collection("posts").add(newpost);
      console.log(p.path)
    
      this.setPercentage(null);
      this.router.navigate(['/'])
    
    }
    
    
    public async editPost(postObj: Post, files: any[], postId: string){
      
      let newTags;
      let editedTags = [];
      //console.log(postObj)
      
      //newObj
      let updatedPost = {
        title: postObj.title,
        content: postObj.content
      };
    
      //check if there are tags to add
      if(postObj.addTags.length > 0){
        newTags = postObj["tags"].concat(postObj["addTags"]);
        updatedPost["tags"] = newTags;
      }else{
        console.log("----> There are no tags to add")
      }

      //check if there are tags to remove
      if(postObj.removeTags.length > 0){
     
        if(updatedPost["tags"]){
        
          updatedPost["tags"].map((t) => {
            if(postObj.removeTags.indexOf(t) == -1){
              editedTags.push(t);
             }
          })
      

        }else{
          postObj["tags"].map((t)=> {
            if(postObj.removeTags.indexOf(t) == -1){
             editedTags.push(t);
            }
          })
  
        
        }
       
        if(editedTags.length == 0){
          console.log("a post must have at least one tag")
          return false;
        }else{
          updatedPost["tags"] = editedTags;
        }       
      }  

      if(files != null){
        await this.uploadImage(files);

        updatedPost["cover"] = this.downloadURL;
        updatedPost["fileref"] = this.filepath;

        const storageRef = this.storage.storage.ref();
        storageRef.child(postObj.fileref).delete()
        .then(()=>{
          console.log("image deleted")
        }).catch(err => {
          console.log(err)
        });
      }
      
      console.log(updatedPost)
      let p = await this.firestore.collection("posts").doc(postId).set(updatedPost, {merge: true});
   
    }



    public deletePost(postId: string, image: string){
      const storageRef = this.storage.storage.ref();
      storageRef.child(image).delete()
      .then(()=>{
        console.log("image deleted")
      }).catch(err => {
        console.log(err)
      });

      this.firestore.collection("posts").doc(postId).delete()
      .then(()=> {
        console.log("Post Successfully Deleted");
        this.router.navigate(["/"]);  
      }).catch(err => {
        console.log(err)
      })

    }
}
