const techValue = () => {
    const category_value = document.getElementById('techValue').value
    // console.log(category_value)
    $('.question_section').empty(); 
    $('.tags').empty();
    let url = `https://interviewhelp.me/categoryName/${category_value}`
    $.ajax({
      type: 'GET',
      url: url,
      success:function(output) {
        const sorted_tags = []
       if(output.length > 0){
          var str = ""
          var tags_str = ""
          for(var i= 0 ; i< output.length ; i++) {
            str += `<div class="row mb-4 edit_div">
                        <div class="form-group col-12 question_block" id="${output[i]._id}">
                            ${output[i].question} 
                        </div>   
                      </div>`
              for(var j =0 ; j < (output[i].tags).length; j++){
                sorted_tags.push(output[i].tags[j]+'_'+[j])
                // tags_str += `<li id= "${[j]}"><a class="tag" id= "${output[i].tags[j]+'_'+[j]}">${output[i].tags[j]}</a></li>`
              }
          }
          console.log(sorted_tags)
          const tag_name = Array.from(new Set(sorted_tags));
          console.log(tag_name)
          const ordered_tags = tag_name.sort();
          console.log(ordered_tags)
          for(var i= 0 ; i< ordered_tags.length ; i++) {
              var toShow = ordered_tags[i].split('_')[0]
              console.log(toShow)
            tags_str += `<li><a class="tag" id= "${ordered_tags}">${toShow}</a></li>`
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


  $('.tags').on('click', function (event) {
    const tag_val = event.target;
    var css_id = (tag_val.id)
    var split_id = (tag_val.id).split('_')[0]
    // before
    $('.tag').css('background-color', '#e3edf9');
    // after
    $('#'+ css_id).css('background-color', '#8aa9c6');
    let url = `https://interviewhelp.me/tags/${split_id}`
    $.ajax({
      type: 'GET',
      url: url,
      success:function(output) {
      //  console.log(output);
       $('.question_section').empty();
  
       if(output.length > 0){
        var str = ""
        for(var i= 0 ; i< output.length ; i++) {
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
      error:function(err) {
        console.log(err)
         }
      });
  })




  $('.question_section').on('click', function (event) {
    const tag_val = event.target;
    console.log(tag_val.id)
    $('#modal-body').empty(); 
    let url = `https://interviewhelp.me/categoryID/${tag_val.id}`
    $.ajax({
      type: 'GET',
      url: url,
      success:function(output) {
        console.log(output)
        if(output.answer == ''){
          $('#answer_value').text('No answer given')
        }else{
          console.log('OUTPUT ANSWER = ' + output.answer)
          $("#modal-body").append(output.answer)
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
