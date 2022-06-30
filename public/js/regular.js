const techValue = () => {
  const category_value = document.getElementById('techValue').value
  // console.log(category_value)
  let url = `https://interviewhelp.me/categoryName/${category_value}`
  // let url = `http://localhost:3000/categoryName/${category_value}`
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
          const showTechtags = {
            tagID : output[i].category_name + "_" + output[i].adminId,
            techTag: output[i].technical_tagName
          }
          technical_tags.push(showTechtags)
          str += `<div class="row mb-4 edit_div">
                      <div class="form-group col-10 question_block" id="${output[i]._id}">
                          ${output[i].question} 
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
      } else {
        $('.select_Category').show()
        $('.question_section .row').hide()
      }
    },
    error: function (err) {
      console.log(err)
    }
  });
}


$('.tags').on('click', function (event) {
  const tag_val = event.target;
  var css_id = (tag_val.id)
  var split_id = (tag_val.id).split('_')[0]
    // before
  $('.single_tag').css('background-color', '#ffffff');
    // after
  $('#' + subTag_id).css('background-color', '#8aa9c6');
  let url = `https://interviewhelp.me/tags/${split_id}` 
  // let url = `http://localhost:3000/tags/${split_id}` 
  $.ajax({
    type: 'GET',
    url: url,
    success: function (output) {
      //  console.log(output);
      $('.question_section').empty();

      if (output.length > 0) {
        var str = ""
        for (var i = 0; i < output.length; i++) {
          str += `<div class="row mb-4 edit_div">
                      <div class="form-group col-10 question_block" id="${output[i]._id}">
                          ${output[i].question} 
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




$('.question_section').on('click', function (event) {
  const tag_val = event.target;
  console.log(tag_val.id)
  $('#modal-body').empty();
  let url = `https://interviewhelp.me/categoryID/${tag_val.id}`
  // let url = `http://localhost:3000/categoryID/${tag_val.id}`
  $.ajax({
    type: 'GET',
    url: url,
    success: function (output) {
      console.log(output)
      if (output.answer == '') {
        $('#answer_value').text('No answer given')
      } else {
        console.log('OUTPUT ANSWER = ' + output.answer)
        $("#modal-body").append(output.answer)
      }
      $('#answerCard').modal('show');
    },
    error: function (err) {
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
  console.log(subTag_id)
      // before
  $('.tags_filter').css('background-color', '#ffffff');
    // after
  $('#' + subTag_id).css('background-color', '#8aa9c6');

  const category_name = subTag_id.split("_")[0]
  const technical_tagName = subTag_id.split("_")[1]
  let url = `https://interviewhelp.me/user/technicalTag`
  // let url = `http://localhost:3000/user/technicalTag`
  $.ajax({
    type: 'POST',
    url: url,
    contentType: "application/json",
    data: JSON.stringify({
      category_name: category_name,
      technical_tagName:tag_val.innerHTML,
    }),
    success: function (output) {
      console.log(output)
      $('.question_section').empty();
      $('.tags').empty();
      if (output) {
        var str = ""
        var tags_str = ""
    
          str += `<div class="row mb-4 edit_div">
                      <div class="form-group col-10 question_block" id="${output._id}">
                          ${output.question} 
                      </div>   
                    </div>`
          for (var j = 0; j < (output.tags).length; j++) {
            tags_str += `<li id= "${[j]}"><a class="tag" id= "${output.tags[j]+'_'+[j]}">${output.tags[j]}</a></li>`
          }

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
