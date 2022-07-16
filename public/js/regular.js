const techValue = () => {
  const role_id = document.getElementById('techValue').value
  // console.log(category_value)
  let url = `https://interviewhelp.me/Jobrole/${role_id}`
  // let url = `http://localhost:3000/Jobrole/${role_id}`
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
            tagID: (output[i]._id).toString(),
            techTag: output[i].techTagname
          }
          technical_tags.push(showTechtags)
          for (var j = 0; j < (output[i].sub_tags).length; j++) {
            const showSubtags = {
              subtagID: output[i].sub_tags[j].subtagId,
              subTag: output[i].sub_tags[j].subtagname
            }
            sub_tags.push(showSubtags)
          }
        }
        var sortedSubtag = sub_tags.sort(function(a, b) {
          var textA = a.subTag.toUpperCase();
          var textB = b.subTag.toUpperCase();
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        for (var k = 0; k < sortedSubtag.length; k++) {
          tags_str += `<li><a class="tag" id= "${sortedSubtag[k].subtagID}">${sortedSubtag[k].subTag}</a></li>`
        }
        var sortedtechnicaltag = technical_tags.sort(function(a, b) {
          var textA = a.techTag.toUpperCase();
          var textB = b.techTag.toUpperCase();
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        for (var j = 0; j < sortedtechnicaltag.length; j++) {
          tech_tags += `<li><a class="single_tag" id="${sortedtechnicaltag[j].tagID}" >${sortedtechnicaltag[j].techTag}</a></li>`
        }
        $('.question_section').append(str)
        $('.tags').append(tags_str)
        $('.tags_filter').append(tech_tags)
        $('.select_Category').hide()
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


$('.tags').on('click', function (event) {
  const tag_val = event.target;
  var css_id = (tag_val.id)
  console.log('= ' + css_id)
  var subtag_id = tag_val.id

  // before
  $('.tag').css('background-color', '#e3edf9');
  // after
  $('#' + css_id).css('background-color', '#8aa9c6');
  let url = `https://interviewhelp.me/subtag/${subtag_id}`
  // let url = `http://localhost:3000/subtag/${subtag_id}`
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
  let url = `https://interviewhelp.me/QA/${tag_val.id}`
  // let url = `http://localhost:3000/QA/${tag_val.id}`
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
  $('.single_tag').css('background-color', '#ffffff');
    // after
  $('#' + subTag_id).css('background-color', '#8aa9c6');

  let url = `https://interviewhelp.me/techtag/${subTag_id}`
  // let url = `http://localhost:3000/techtag/${subTag_id}`
  $.ajax({
    type: 'GET',
    url: url,
    success: function (output) {
      console.log(output)
      $('.question_section').empty();
      $('.tags').empty();
      if (output) {
        var tags_str = ""
        const sub_tags = []
        for (var i = 0; i < output.length; i++) {
          const showSubtags = {
            subtagID: (output[i]._id).toString(),
            subTag: output[i].SubtagName
          }
          sub_tags.push(showSubtags)
        }
        var sortedSubtag = sub_tags.sort(function(a, b) {
          var textA = a.subTag.toUpperCase();
          var textB = b.subTag.toUpperCase();
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        for (var k = 0; k < sortedSubtag.length; k++) {
          tags_str += `<li><a class="tag" id= "${sortedSubtag[k].subtagID}">${sortedSubtag[k].subTag}</a></li>`
        }
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
