const techValue = () => {
  const role_id = document.getElementById('techValue').value
  const adminID = (window.location.href).split('admin/')[1]
  // let url = `https://intadmin.herokuapp.com/categoryName/${category_value}`
  let url = `https://interviewhelp.me/AdminJobrole/${adminID}/${role_id}`
  // let url = `http://localhost:3000/AdminJobrole/${adminID}/${role_id}`
console.log('JOB ROLE ID = ' + role_id)
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
        const sub_tags = []
        for (var i = 0; i < output.length; i++) {
          // var categoryId = (output[i]._id).toString()
          console.log(output[i])
          const showTechtags = {
            tagID : (output[i]._id).toString(),
            techTag: output[i].techTagname
          }
          technical_tags.push(showTechtags)
          for (var j = 0; j < (output[i].sub_tags).length; j++) {
            const showSubtags = {
              subtagID : output[i].sub_tags[j].subtagId ,
              subTag: output[i].sub_tags[j].subtagname
            }
            sub_tags.push(showSubtags)
        }
      }
      // const idsub = sub_tags.map(o => o.tagID)
      // const filteredsub = sub_tags.filter(({tagID}, index) => !idsub.includes(tagID, index + 1))
      // console.log(filteredsub)
      for (var k = 0; k < sub_tags.length; k++) {
      tags_str += `<li><a class="tag" id= "${sub_tags[k].subtagID}">${sub_tags[k].subTag}</a></li>`
    }
      // 
        // const ids = technical_tags.map(o => o.tagID)
        // const filtered = technical_tags.filter(({tagID}, index) => !ids.includes(tagID, index + 1))
        // console.log(filtered)
        for (var j = 0; j < technical_tags.length; j++) {
          tech_tags += `<li><a class="single_tag" id="${technical_tags[j].tagID}" >${technical_tags[j].techTag}</a></li>`
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
  console.log(targetElement + '---------------------')
  const adminID = (window.location.href).split('admin/')[1]
  console.log(adminID)
  window.open(`https://interviewhelp.me/Admin/update/feature/${targetElement}/${adminID}`, "_self");
  // window.open(`http://localhost:3000/Admin/update/feature/${targetElement}/${adminID}` ,"_self");
}

const deleteQuestion = (targetElement) => {
  console.log(targetElement)
  let url = `https://interviewhelp.me/Admin/QAdelete/${targetElement}`
  // let url = `http://localhost:3000/Admin/QAdelete/${targetElement}`
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
  console.log('= ' + css_id)
  var subtag_id = tag_val.id
  const adminID = (window.location.href).split('admin/')[1]

  // before
  $('.tag').css('background-color', '#e3edf9');
  // after
  $('#' + css_id).css('background-color', '#8aa9c6');
  let url = `https://interviewhelp.me/Adminsubtag/${adminID}/${subtag_id}`
  // let url = `http://localhost:3000/Adminsubtag/${adminID}/${subtag_id}`
  console.log(url)
  $.ajax({
    type: 'GET',
    url: url,
    // contentType: "application/json",
    // data: JSON.stringify({
    //   jobRoleid: jobRoleid,
    //   subtagName:subtagName,
    //   adminID:adminID
    // }),
    success: function (output) {
        console.log(output);
      $('.question_section').empty();

      if (output.length > 0) {
        var str = ""
        for (var i = 0; i < output.length; i++) {
          var questionId = (output[i]._id).toString()
          // var edit_div = 'question_div' + [i]
          str += `<div class="row mb-4 edit_div">
                    <div class="form-group col-10 question_block" id="${output[i]._id}">
                        ${output[i].question} 
                    </div>
                    <div class="form-group col-2">
                    <i class="fas fa-edit edit-logo" id="${questionId}"></i>
                    <i class="fas fa-trash delete-logo" id="${questionId}"></i>
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
  // const adminID = (window.location.href).split('feature/')[1]
  // console.log(adminID)
  const adminID = 'AdminUpdated'
  // const adminUserid = adminID.split('/')[0]
  var myContent = tinymce.get("myTextarea").getContent();
  console.log('updated Content = ' + myContent)
  // var category_name = $('#category_name').val()
  var question = $('#question').val()
  console.log('UPDATED QUESTION = ' + question)
  // var tags = $('#tags').val()
  // console.log('UPDATED TAGS = ' + tags)
  // var Technical_tag = $('#technicalTag').val()
  // var technical_tag_id = $('#technical_tag_id').val()
  console.log('QuestionValue = ' + id_val)
  let url = `https://interviewhelp.me/Admin/feature/update/${id_val}`
    // let url = `http://localhost:3000/Admin/feature/update/${id_val}`
  $.ajax({
    type: 'PUT',
    url: url,
    contentType: "application/json",
    data: JSON.stringify({
      question: question,
      answer: myContent,
    }),
    success: function (output) {
      console.log(output);
      window.open(`https://interviewhelp.me/categories/admin/${adminID}`, "_self")
      // window.open(`http://localhost:3000/categories/admin/${adminID}`,"_self")
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
  let url = `https://interviewhelp.me/AdminQA/${tag_val.id}`
  // let url = `http://localhost:3000/AdminQA/${tag_val.id}`
  console.log(url)
  $.ajax({
    type: 'GET',
    url: url,
    success: function (output) {
      console.log(JSON.stringify(output))
     
        $("#modal-body").append(output.answer)
      
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

  const technicalTagid = subTag_id
  // console.log()
  // let url = `http://localhost:3000/Admintechtag/${technicalTagid}`
  let url = `https://interviewhelp.me/Admintechtag/${technicalTagid}`
  $.ajax({
    type: 'GET',
    url: url,
    success: function (output) {
      if (output) {
        console.log(output)
        var tags_str = ""
        // ----------------/---------------------------------------------------
          // $('.question_section').empty();
          $('.tags').empty();
          // $('.tags_filter').empty();
          var tags_str = ""
          const sub_tags = []
          for (var i = 0; i < output.length; i++) {
            const showSubtags = {
              subtagID : (output[i]._id).toString(),
              subTag: output[i].SubtagName
            }
            sub_tags.push(showSubtags)
          //   for (var j = 0; j < (output[i].sub_tags).length; j++) {

          // }
        }
        for (var k = 0; k < sub_tags.length; k++) {
        tags_str += `<li><a class="tag" id= "${sub_tags[k].subtagID}">${sub_tags[k].subTag}</a></li>`
      }


        // ----------------------------------------------------------------------
        // $('.question_section').append(str)
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

function todayDate(){
  var now = new Date();
 
  var day = ("0" + now.getDate()).slice(-2);
  var month = ("0" + (now.getMonth() + 1)).slice(-2);

  var today = now.getFullYear()+"-"+(month)+"-"+(day) ;


 $('#date').val(today);
}

todayDate()
