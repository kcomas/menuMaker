(function($){

    $('body').on('click', '.remove', function() {
            $(this).parent().parent().remove();
    });

    var counter = 0;
    //create new sortable
    var $sort_url = $('#sortable');
    $sort_url.sortable({
        placeholder: "ui-state-highlight",    
        connectWith: ".connectedSortable"
    }).disableSelection();
    //the top text/buttons
    var $name = $('#name');
    var $link = $('#link');
    var $add_link = $('#add-link');
    var $save = $('#save');
    var $clear = $('#clear');
    var $dialog = $('#dialog');
    var $load = $('#load');
    var $blank = $('#blank');
    var $toHtml = $('#html');

    //append the children to the current part of the obj
    function load(elm,obj){
       if($.isArray(obj)){
           obj.forEach(function(data){
                var next_elm = add_element(elm,data.name,data.link,data.blank);
                if(data.children){
                    if(data.children.length > 0){
                        var child = data.children.shift();
                        load(next_elm,child);
                    }
                }
           });
       } else {
            var next_elm = add_element(elm,obj.name,obj.link,data.blank);
            if(obj.children){
                if(obj.children.length > 0){
                    var child = obj.children.shift();
                    load(next_elm,child);
                }
            }
       }
    }

    //load the json into the view
    $load.click(function(e){
        var html = '<textarea class="load" width=100 height=100></textarea>';
        $dialog.html(html);
        $dialog.dialog({
            title:"Load JSON",
            close : function(ev,ui){
                //grab json
                var json = $dialog.find('.load').val();
                //convert to a json obj
                try {
                    json = JSON.parse(json);
                } catch(err){
                    return;
                }
                //delete current model
                $sort_url.find('li').remove();
                counter = 0;
                load($sort_url,json);
            },
            buttons:{
                load:function(){
                    $(this).dialog("close");
                }
            }
        });
    });

    //delete all
    $clear.click(function(e){
        $sort_url.find('li').remove();
    });

    $('body').on('click', '.edit', function() {
        var $dataDiv = $(this).parent();
        var name = $dataDiv.attr('data-name');
        var link = $dataDiv.attr('data-link');
        var blank = $dataDiv.attr('data-blank');
        var html = 'Name: <input class="name" type="text" value="'+name+'" /><br /> Link: <input type="text" class="link" value="'+link+'"/> <br /> ';
        if(blank === 'true'){
            html+= 'Blank: <input type="checkbox" class="blank"  checked="'+blank+'"/>';
        } else {
            html+= 'Blank: <input class="blank"  type="checkbox"/>';
        }
        $dialog.html(html);
        $dialog.dialog({
            title:"Edit",
            close : function(ev,ui){
                var newName = $dialog.find('.name').val();
                var newLink = $dialog.find('.link').val()
                $dataDiv.attr('data-name',newName);
                $dataDiv.children('span.name').html(newName);
                $dataDiv.attr('data-link',newLink);
                $dataDiv.children('span.link').html(newLink);
                $dataDiv.attr('data-blank',$dialog.find('.blank').prop('checked'));
            },
            buttons:{
                save:function(){
                    $(this).dialog("close");
                }
            }
        });
    });


    function add_element(place,name,link,blank){
        if(typeof name === "undefined"){
            name = "";
        }
        if(typeof link === "undefined"){
            link = "";
        }
        //create a new sortable
        var newLi = $('<li></li>');
        newLi.addClass('ui-state-default');
        newLi.addClass('list-group-item');
        //append a place to edit the item
        var newDiv = $('<div class="subDiv" data-blank="'+blank+'" data-name="'+name+'" data-link="'+link+'">Name:<span class="name">'+name+'</span> Link:<span class="link">'+link+'</span></div>');
        var editButton = $('<button class="edit">Edit</button>');
        var removeButton = $('<button class="remove">X</button>');
        newDiv.append(editButton);
        newDiv.append(removeButton);
        $name.val('');
        $link.val('');
        newLi.append(newDiv);
        var newUl = $('<ul></ul>',{'id':'sortable'+counter});
        counter++;
        //create new sub sortable
        newUl.addClass('list-group');
        newUl.addClass('sub-item');
        newUl.addClass('connectedSortable');
        newUl.sortable({
            placeholder:"ui-state-highlight",
            connectWith: ".connectedSortable"
        }).disableSelection();
        //add to the cuurent sortable
        newDiv.append(newUl);
        place.append(newLi);
        return newUl;
    }

    $add_link.click(function(e){
            add_element($sort_url,$name.val(),$link.val(),$blank.prop('checked'));
    });
    
    function recurse(elm,arr){
        elm.children('li').children('.subDiv').each(function(data){
            var obj = {};
            $data = $(this);
            obj.name = $data.attr('data-name');
            obj.link = $data.attr('data-link');
            obj.blank = $data.attr('data-blank');
            var next = $data.children('ul');
            obj.children = recurse(next,[]);
            arr.push(obj);
        });
        return arr;
    }

    //save the menu
    $save.click(function(e){
        var jsonObj = recurse($sort_url,[]);
        $dialog.html('<pre>'+JSON.stringify(jsonObj)+'</pre>');
        $dialog.dialog({
            title:"JSON",
            buttons:{
                exit:function(){
                    $(this).dialog("close");
            }
        }   
        });
    });

    function toHtml(obj,html){
           if($.isArray(obj)){
                obj.forEach(function(data){
                    html += toHtml(data,''); 
                });
           } else {
                //create a new element
                var item = '<li><a href="'+obj.link+'"';
                if(obj.blank){
                    item+= ' target="_blank"';
                }
                item+= '>'+obj.name+'</a></li>';
                html += item;
                if(obj.children){
                    if(obj.children.length > 0){
                        html += '<ul>'+toHtml(obj.children,'')+'</ul>';
                    }
                }
           }
           return html;
    }

    //convert to basic html menu
    $toHtml.click(function(e){
        var jsonObj = recurse($sort_url,[]);
        var html = '<nav>'+toHtml(jsonObj,'')+'</nav>';
        $dialog.html('<textarea>'+html+'</textarea>');
        $dialog.dialog({
            title:"HTML",
            buttons:{
                exit:function(){
                    $(this).dialog("close");
            }
        }   
        });
    });

})(jQuery);
