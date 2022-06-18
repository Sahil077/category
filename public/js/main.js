

const techValue = () => {
  const category_value = document.getElementById('techValue').value
  const adminID = (window.location.href).split('admin/')[1]

  $('.question_section').empty();
  $('.tags').empty();
  // let url = `https://intadmin.herokuapp.com/categoryName/${category_value}`
  let url = `https://interviewhelp.me/categoryName/${adminID}/${category_value}`
  $.ajax({
    type: 'GET',
    url: url,
    success:function(output) {
    //  console.log(output);
     if(output.length > 0){
        var str = ""
        var tags_str = ""
        for(var i= 0 ; i< output.length ; i++) {
          var categoryId = (output[i]._id).toString()
          // var edit_div = 'question_div' + [i]
          str += `<div class="row mb-4 edit_div">
                      <div class="form-group col-10 question_block" id="${output[i]._id}">
                          ${output[i].question} 
                      </div>
                      <div class="form-group col-2">
                          <i class="fas fa-edit edit-logo" id="${categoryId}"></i>
                          <i class="fas fa-trash delete-logo" id="${categoryId}"></i>
                      </div>   
                    </div>`
            for(var j =0 ; j < (output[i].tags).length; j++){
              tags_str += `<li id= "${[j]}"><a class="tag" id= "${output[i].tags[j]+'_'+[j]}">${output[i].tags[j]}</a></li>`
            }
        
        }
        $('.question_section').append(str)
        $('.tags').append(tags_str)
        $('.select_Category').hide()
        // console.log(str)
      }else{
        $('.select_Category').show()
        $('.question_section .row').hide()
      }
    },
    error:function(err) {
      console.log(err)
       }
    });


  
}


$('.question_section').on('click', function (event) {
  const targetElement = event.target;
  if (targetElement.matches('.edit-logo')) {
    editQuestion(targetElement.id);
    // console.log(targetElement.id)
  }

  if (targetElement.matches('.delete-logo')) {
    deleteQuestion(targetElement.id)
  }
})


const editQuestion = (targetElement) => {
  console.log(targetElement)
  const adminID = (window.location.href).split('admin/')[1]
  window.open(`https://interviewhelp.me/admin/feature/adminId/${adminID}/updateID/${targetElement}` ,"_self");
}

const deleteQuestion = (targetElement) => {

  let url = `https://interviewhelp.me/categoryID/${targetElement}`
  $.ajax({
    type: 'DELETE',
    url: url,
    success:function(output) {
     console.log(output)
     location.reload()
    },
    error:function(err) {
      console.log(err)
       }
    });
}

$('.tags').on('click', function (event) {
  const tag_val = event.target;
  var css_id = (tag_val.id)
  var split_id = (tag_val.id).split('_')[0]
  const adminID = (window.location.href).split('admin/')[1]
  // before
  $('.tag').css('background-color', '#e3edf9');
  // after
  $('#'+ css_id).css('background-color', '#8aa9c6');
  let url = `https://interviewhelp.me/${adminID}/tags/${split_id}`
  console.log(url)
  $.ajax({
    type: 'GET',
    url: url,
    success:function(output) {
    //  console.log(output);
     $('.question_section').empty();

     if(output.length > 0){
      var str = ""
      for(var i= 0 ; i< output.length ; i++) {
        var categoryId = (output[i]._id).toString()
        // var edit_div = 'question_div' + [i]
        str += `<div class="row mb-4 edit_div">
                    <div class="form-group col-10 question_block" id="${output[i]._id}">
                        ${output[i].question} 
                    </div>
                    <div class="form-group col-2">
                    <i class="fas fa-edit edit-logo" id="${categoryId}"></i>
                    <i class="fas fa-trash delete-logo" id="${categoryId}"></i>
                    </div>   
                  </div>`
      }
      $('.question_section').append(str)
      $('.select_Category').hide()
      // console.log(str)
    }

    },
    error:function(err) {
      console.log(err)
       }
    });
})

// Update form

const update_category = (id_val) => {
  // console.log(id_val)
  const adminID = (window.location.href).split('adminId/')[1]
  const adminUserid = adminID.split('/')[0]
  // console.log(adminUserid)
  var category_name = $('#category_name').val()
  var question = $('#question').val()
  var answer = $('#answer').val()
  var tags = $('#tags').val()
  // let url = `https://intadmin.herokuapp.com/categoryID/${adminID}/${id_val}`
  let url = `https://interviewhelp.me/categoryID/${id_val}`
 
  $.ajax({
    type: 'PUT',
    url: url,
    contentType: "application/json",
    data : JSON.stringify({
      category_name:category_name,
      question:question,
      answer:answer,
      tags:tags
    }),
    success:function(output) {
     console.log(output);
     window.open(`https://interviewhelp.me/categories/admin/${adminUserid}`,"_self")
    },
    error:function(err) {
      console.log(err)
       }
    });

}


$('.question_section').on('click', function (event) {
  const tag_val = event.target;
  console.log(tag_val)

  let url = `https://intadmin.herokuapp.com/categoryID/${tag_val.id}`
  $.ajax({
    type: 'GET',
    url: url,
    success:function(output) {
      if(output.answer == ''){
        $('#answer_value').text('No answer given')
      }else{
        $('#answer_value').text(output.answer)
      }
     $('#answerCard').modal('show');
    },
    error:function(err) {
      console.log(err)
       }
    });
})

const close_answer = () => {
  $('#answerCard').modal('hide');
}
