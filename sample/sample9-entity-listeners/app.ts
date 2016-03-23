import {CreateConnectionParameters, createConnection} from "../../src/typeorm";
import {Post} from "./entity/Post";
import {PostCategory} from "./entity/PostCategory";
import {PostAuthor} from "./entity/PostAuthor";

const options: CreateConnectionParameters = {
    driver: "mysql",
    connectionOptions: {
        host: "192.168.99.100",
        port: 3306,
        username: "root",
        password: "admin",
        database: "test",
        autoSchemaCreate: true
    },
    entityDirectories: [__dirname + "/entity"],
    subscriberDirectories: [__dirname + "/subscriber"]
};

createConnection(options).then(connection => {
    let category1 = new PostCategory();
    category1.name = "post category #1";

    let category2 = new PostCategory();
    category2.name = "post category #2";
    
    let author = new PostAuthor();
    author.name = "Umed";

    let post = new Post();
    post.text = "Hello how are you?";
    post.title = "hello";
    post.categories.push(category1, category2);
    post.author = author;

    let postRepository = connection.getRepository(Post);

    postRepository
        .persist(post)
        .then(post => {
            console.log("Post has been saved");
            console.log("---------------------------");
            return postRepository.findById(post.id);
        })
        .then(loadedPost => {
            console.log("post is loaded. Its uid is " + loadedPost.uid);
            console.log("Lets now load it with relations.");
            console.log("---------------------------");
            return postRepository
                .createQueryBuilder("p")
                .leftJoinAndSelect("p.author", "author")
                .leftJoinAndSelect("p.categories", "categories")
                .where("p.id = :id", { id: loadedPost.id })
                .getSingleResult();
        })
        .then(loadedPost => {
            console.log("load finished. Now lets update entity");
            console.log("---------------------------");
            loadedPost.text = "post updated";
            loadedPost.author.name = "Bakha";
            return postRepository.persist(loadedPost);
        })
        .then(loadedPost => {
            console.log("update finished. Now lets remove entity");
            console.log("---------------------------");
            return postRepository.remove(loadedPost);
        })
        .then(loadedPost => {
            console.log("post removed.");
        })
        .catch(error => console.log("Cannot save. Error: ", error.stack ? error.stack : error));

}, error => console.log("Cannot connect: ", error.stack ? error.stack : error));