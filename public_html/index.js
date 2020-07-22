/*
Author: Hassan Alnamer
This is the client for my Ostra market place. The user can do the following:
1) add user
2) add item for specific user
*/

/*
This method adds a user to the database
We do so by using a post requests
*/
function addUser(){
  console.log("addign user...");
  console.log("user: "+ $("#userName").val() + "\tpasswrd"+$("#password").val());
  $.ajax({
    type: "POST",
    url: "/add/user/",
    data: {user: $("#userName").val(), pass: $("#password").val()},
    success: function(data){
      alert(data);
    }
  });
}
/*
This function adds an item to a user listings. The item will be added to the items models
also, the (title, description, image, price, status) are in the POST parameters
*/
function addItem(){
  console.log("client: adding item...");
  console.log("title: "+ $("#title").val()
              +"\ndescription: "+ $("#description").val()+
              "\nimage: "+$("#image").val()+
              "\nprice: "+$("#price").val()+
              "\nstatus"+ $("#status").val()
            );
  $.ajax({
    type: "POST",
    url: "/add/item/"+ $("#userName").val(),
    data: {
        title:  $("#title").val(),
        description: $("#description").val(),
        image: $("#image").val(),
        price: $("#price").val(),
        status: $("#status").val(),
          },
    success: function(data){
      alert(data);
    }
    });
}
