const techValue = () => {
  const category_value = document.getElementById('techValue').value
  const adminID = (window.location.href).split('admin/')[1]
  // let url = `https://intadmin.herokuapp.com/categoryName/${category_value}`
  let url = `https://interviewhelp.me/categoryName/${adminID}/${category_value}`
  // let url = `http://localhost:3000/categoryName/${adminID}/${category_value}`
  $.ajax({
    type: 'GET',
    url: url,
    success: function (output) {
      console.log(output);
      if (output.length > 0) {
        $('.question_section').empty();
        $('.tags').empty();
        $('.tags_filter').empty();
        var str = ""
        var tags_str = ""
        var tech_tags = ""
        const technical_tags = []
        for (var i = 0; i < output.length; i++) {
          var categoryId = (output[i]._id).toString()
          console.log(output[i])
          const showTechtags = {
            tagID : output[i].category_name + "_" + output[i].adminId,
            techTag: output[i].technical_tagName
          }
          technical_tags.push(showTechtags)
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
          for (var j = 0; j < (output[i].tags).length; j++) {
            tags_str += `<li id= "${[j]}"><a class="tag" id= "${output[i].tags[j]+'_'+[j]}">${output[i].tags[j]}</a></li>`
          }
        }
        console.log(technical_tags)
        for (var j = 0; j < technical_tags.length; j++) {
          tech_tags += `<li><a class="single_tag" id="${technical_tags[j].tagID}_${[j]}" >${technical_tags[j].techTag}</a></li>`
        }
        $('.question_section').append(str)
        $('.tags').append(tags_str)
        $('.tags_filter').append(tech_tags)
        $('.select_Category').hide()
        // console.log(str)
      } else {
        $('.select_Category').show()
        $('.question_section .row').hide()
        $('.tags .tag').hide()
        $('.tags_filter .single_tag').hide()
      }
    },
    error: function (err) {
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
  window.open(`https://interviewhelp.me/admin/feature/adminId/${adminID}/updateID/${targetElement}`, "_self");
  // window.open(`http://localhost:3000/admin/feature/adminId/${adminID}/updateID/${targetElement}` ,"_self");
}

const deleteQuestion = (targetElement) => {

  let url = `https://interviewhelp.me/categoryID/${targetElement}`
  // let url = `http://localhost:3000/categoryID/${targetElement}`
  $.ajax({
    type: 'DELETE',
    url: url,
    success: function (output) {
      console.log(output)
      location.reload()
    },
    error: function (err) {
      console.log(err)
    }
  });
}

$('.tags').on('click', function (event) {
  const tag_val = event.target;
  var css_id = (tag_val.id)
  console.log('CSS_ID = ' + css_id)
  var split_id = (tag_val.id).split('_')[0]
  console.log('SPLIT_ID = ' + split_id)
  const adminID = (window.location.href).split('admin/')[1]
  // before
  $('.tag').css('background-color', '#e3edf9');
  // after
  $('#' + css_id).css('background-color', '#8aa9c6');
  let url = `https://interviewhelp.me/${adminID}/tags/${split_id}`
  // let url = `http://localhost:3000/${adminID}/tags/${split_id}`
  console.log(url)
  $.ajax({
    type: 'GET',
    url: url,
    success: function (output) {
        console.log(output);
      $('.question_section').empty();

      if (output.length > 0) {
        var str = ""
        for (var i = 0; i < output.length; i++) {
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
    error: function (err) {
      console.log(err)
    }
  });
})

// Update form

const update_category = (id_val) => {
  // console.log(id_val)
  const adminID = (window.location.href).split('adminId/')[1]
  const adminUserid = adminID.split('/')[0]
  var myContent = tinymce.get("myTextarea").getContent();
  console.log('update = ' + myContent)
  var category_name = $('#category_name').val()
  var question = $('#question').val()
  var tags = $('#tags').val()
  var Technical_tag = $('#technicalTag').val()
  var technical_tag_id = $('#technical_tag_id').val()
  console.log('cat = ' + id_val)
  // let url = `https://intadmin.herokuapp.com/categoryID/${adminID}/${id_val}`
  let url = `https://interviewhelp.me/categoryID/${id_val}`
  // let url = `http://localhost:3000/categoryID/${id_val}`

  $.ajax({
    type: 'PUT',
    url: url,
    contentType: "application/json",
    data: JSON.stringify({
      category_name: category_name,
      question: question,
      answer: myContent,
      tags: tags,
      Technical_tag:Technical_tag,
      technical_tag_id:technical_tag_id
    }),
    success: function (output) {
      console.log(output);
      window.open(`https://interviewhelp.me/categories/admin/${adminUserid}`, "_self")
      // window.open(`http://localhost:3000/categories/admin/${adminUserid}`,"_self")
    },
    error: function (err) {
      console.log(err)
    }
  });

}


$('.question_section').on('click', function (event) {
  const tag_val = event.target;
  console.log(tag_val.id)
  $('#modal-body').empty();
  let url = `https://interviewhelp.me/categoryID/${tag_val.id}`
  // let url = `http://localhost:3000/categoryID/${tag_val.id}`
  console.log(url)
  $.ajax({
    type: 'GET',
    url: url,
    success: function (output) {
      console.log('categoryID API SUCCESS')
      if (output.answer == '') {
        $('#answer_value').text('No answer given')
      } else {
        $("#modal-body").append(output.answer)
      }
      $('#answerCard').modal('show');
    },
    error: function (err) {
      console.log('categoryID API HIT ERR')
      console.log(err)
    }
  });
})

const close_answer = () => {
  $('#answerCard').modal('hide');
}

$('.tags_filter').on('click', function (event) {
  
  const tag_val = event.target;
  var subTag_id = tag_val.id
  console.log(tag_val.innerHTML)
  console.log(subTag_id)
    // before
  $('.single_tag').css('background-color', '#ffffff');
    // after
  $('#' + subTag_id).css('background-color', '#8aa9c6');

  const category_name = subTag_id.split("_")[0]
  const adminID = subTag_id.split("_")[1]
  const technical_tagName = tag_val.innerHTML
  // console.log()
  // let url = `http://localhost:3000/technicalTag`
  let url = `https://interviewhelp.me/technicalTag`
  $.ajax({
    type: 'POST',
    url: url,
    contentType: "application/json",
    data: JSON.stringify({
      category_name: category_name,
      technical_tagName:technical_tagName,
      adminID:adminID
    }),
    success: function (output) {
      // console.log(output)
      $('.question_section').empty();
      $('.tags').empty();
      if (output) {
        var str = ""
        var tags_str = ""
        // for (var i = 0; i < output.length; i++) {
          var categoryId = (output._id).toString()      

          str += `<div class="row mb-4 edit_div">
                      <div class="form-group col-10 question_block" id="${output._id}">
                          ${output.question} 
                      </div>
                      <div class="form-group col-2">
                          <i class="fas fa-edit edit-logo" id="${categoryId}"></i>
                          <i class="fas fa-trash delete-logo" id="${categoryId}"></i>
                      </div>   
                    </div>`
          for (var j = 0; j < (output.tags).length; j++) {
            tags_str += `<li id= "${[j]}"><a class="tag" id= "${output.tags[j]+'_'+[j]}">${output.tags[j]}</a></li>`
          }
        // }
      //  console.log(str)
        $('.question_section').append(str)
        $('.tags').append(tags_str)
        $('.select_Category').hide()
        // console.log(str)
      } else {
        $('.select_Category').show()
        $('.question_section .row').hide()
      }


    },
    error: function (err) {
      console.log(err)
    }
  });
})
