export interface Post {
    title: string, 
    content: string, 
    cover?: string,
    oldcover?: string,
    id?: string,
    tags: string[],
    removeTags?: string[],
    addTags?: string[],
    fileref?: string
}