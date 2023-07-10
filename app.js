//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://taweedaa:VToDPjkq9dedLclh@cluster0.ewymtia.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const phone = new Item ({
  name: "phone"
})

const laptop = new Item ({
  name: "laptop"
})

const table = new Item ({
  name: "table"
})

const defaultItems = [phone, laptop, table]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

app.get("/", function(req, res) {

  Item.find({})
  .then((foundItems) => {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems)
      .then (() => {
        console.log("success");
      }).catch ((error) => {
        console.error();
      });
      res.redirect("/");
    } else {
          res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  }).catch((err)=> {
    console.error();
  });

});

app.get("/:customListName", (req, res) => {
 
  const customListName = _.capitalize(req.params.listsName);

  List.findOne({name:customListName})
    .then(function(foundList){
        
          if(!foundList){
            const list = new List({
              name: customListName,
              items:defaultItems
            });
          
            list.save();
            // console.log("saved");
            res.redirect("/"+customListName);
          }
          else{
            res.render("list",{listTitle: foundList.name, newListItems:foundList.items});
          }
    })
    .catch(function(err){});
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const listName = req.body.list

  const item = new Item ({
    name: itemName
  })
  
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName})
    .then (() => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    }).catch((err)=> {})
  }


});

app.post("/delete", function(req, res)  {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName

  if (listName ==="Today"){
        Item.findByIdAndRemove(checkedItemId)
      .then (() => {
        console.log("Successfully deleted");
        res.redirect("/");
      }).catch((error) => {
        console.error();
      });

  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
    .then((foundList) => {
      res.redirect("/" + listName);
    }).catch((err) => {})
  }

  
});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
