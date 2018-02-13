$(function() {

    var p = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,1,1,1,1,1,0,0],
        [0,1,1,0,0,1,1,0],
        [0,1,1,0,0,1,1,0],
        [0,1,1,1,1,1,0,0],
        [0,1,1,0,0,0,0,0],
        [0,1,1,0,0,0,0,0],
        [0,1,1,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
    ];
    var i = [
        [0,0,0,0,0,0],
        [0,0,0,0,0,0],
        [0,1,1,1,1,0],
        [0,0,1,1,0,0],
        [0,0,1,1,0,0],
        [0,0,1,1,0,0],
        [0,0,1,1,0,0],
        [0,0,1,1,0,0],
        [0,1,1,1,1,0],
        [0,0,0,0,0,0],
        [0,0,0,0,0,0],
    ];
    var x = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,1,1,0,0,0,1,0],
        [0,1,1,0,0,0,1,0],
        [0,0,1,1,0,1,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,1,0,1,1,0,0],
        [0,1,0,0,0,1,1,0],
        [0,1,0,0,0,1,1,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
    ];
    var e = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,1,1,1,1,1,1,0],
        [0,1,1,0,0,0,0,0],
        [0,1,1,0,0,0,0,0],
        [0,1,1,1,1,1,0,0],
        [0,1,1,0,0,0,0,0],
        [0,1,1,0,0,0,0,0],
        [0,1,1,1,1,1,1,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
    ];
    var l = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,1,1,0,0,0,0,0],
        [0,1,1,0,0,0,0,0],
        [0,1,1,0,0,0,0,0],
        [0,1,1,0,0,0,0,0],
        [0,1,1,0,0,0,0,0],
        [0,1,1,0,0,0,0,0],
        [0,1,1,1,1,1,1,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
    ];

    var r = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,1,1,1,1,1,0,0],
        [0,1,1,0,0,1,1,0],
        [0,1,1,0,0,1,1,0],
        [0,1,1,1,1,1,0,0],
        [0,1,1,0,0,1,1,0],
        [0,1,1,0,0,1,1,0],
        [0,1,1,0,0,1,1,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
    ];

    var o = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,1,1,1,1,0,0],
        [0,1,1,0,0,1,1,0],
        [0,1,1,0,0,1,1,0],
        [0,1,1,0,0,1,1,0],
        [0,1,1,0,0,1,1,0],
        [0,1,1,0,0,1,1,0],
        [0,0,1,1,1,1,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
    ];

    var t = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,1,1,1,1,1,1,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
    ];

    var y =[
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,1,1,0,0,0,1,0],
        [0,1,1,0,0,0,1,0],
        [0,0,1,1,0,1,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
    ];

    var spans    = ['#span-pixel','#span-property'];
    var words   = [[p,i,x,e,l],[p,r,o,p,e,r,t,y]];
    var gap     = 0;
    var size    = 6;
    var size2   = size + 4;
    var square  = '';
    var x       = 0;
    var y       = 0;
    var svgWidth  = 6 * size + (5 * gap) + gap;
    var svgHeight = 7 * size + (6 * gap) + gap;

    // generate shadow pixels first b/c of how svg rects stack
    for (var w = 0; w < words.length; w++) { 
        // if (w == 0) continue;
        for (var i = 0; i < words[w].length; i++) {
            var svgWidth    = words[w][i][0].length * size + ((words[w][i][0].length - 1)   * gap) + gap;
            var svgHeight   = words[w][i].length    * size + ((words[w][i].length - 1)      * gap) + gap;
            var elementSvg  = '<svg class="svg-letter" id="letter-' + (w + '' + i) + '" data-index="' + (w + '' + i)
                                + '" width="' + svgWidth + '" height="' + svgHeight + '" style="margin:5px;">'
            $(spans[w]).append(elementSvg);
            for (var j = 0; j < words[w][i].length; j++) {
                for (var k = 0; k < words[w][i][j].length; k++) {
                    if (words[w][i][j][k] == 0) {
                        continue;
                    }
                    x = k * (size + gap) + (gap / 2);
                    y = j * (size + gap) + (gap / 2);
                    x += 3;
                    y += 3;
                    square = '<rect data-x="' + x + '" data-y="' + y + '"class="pixels shadow shadow-' + (w + '' + i) 
                            + '" x="' + x + '" y="' + (-100)
                            + '" width="' + size2 + '" height="' + size2 + '" />';
                    $('#letter-' + (w + '' + i)).append(square);                            
                }
            }
        }
    }

    // generate white pixels
    for (var w = 0; w < words.length; w++) { 
        // if (w == 0) continue;
        for (var i = 0; i < words[w].length; i++) {
            var svgWidth    = words[w][i][0].length * size + ((words[w][i][0].length - 1)   * gap) + gap;
            var svgHeight   = words[w][i].length    * size + ((words[w][i].length - 1)      * gap) + gap;
            for (var j = 0; j < words[w][i].length; j++) {
                for (var k = 0; k < words[w][i][j].length; k++) {
                    if (words[w][i][j][k] == 0) {
                        continue;
                    }
                    x = k * (size + gap) + (gap / 2);
                    y = j * (size + gap) + (gap / 2);
                    square = '<rect data-x="' + x + '" data-y="' + y + '"class="pixels pixel pixel-' + (w + '' + i) 
                            + '" x="' + x + '" y="' + (-100)
                            + '" width="' + size + '" height="' + size + '" />';
                    $('#letter-' + (w + '' + i)).append(square);
                }
            }
        }
    }

    // have to refresh the div when placing svg with jquery
    $("#main-info").html($("#main-info").html());

    // var size = 12;
    // var size2 = size + 10;

    function explode(element, elementSize, svgWidth, svgHeight) {
        // element.clearQueue();
        var x = Math.floor(Math.random() * (svgWidth - elementSize)) + 1;
        var y = Math.floor(Math.random() * (svgHeight - elementSize)) + 1;
        var rand = Math.floor(Math.random() * 3) + 2;
        element.animate({
            svgX: x,
            svgY: y,
            svgWidth: elementSize / rand,
            svgHeight: elementSize / rand
        }, {duration: 200});
    }

    function implode(element, elementSize) {
        // element.clearQueue();
        element.animate({
                svgX: element.data('x'),
                svgY: element.data('y'),
                svgWidth: elementSize,
                svgHeight: elementSize
        }, {duration: 100});
    }

    $('.svg-letter').mouseenter(function() {
        var index = this.id.replace('letter-', '');
        var w = $(this).attr('width');
        var h = $(this).attr('height');
        $('.pixel-' + index).each(function(i, obj) {
            explode($(this), size, w, h);
        });
        $('.shadow-' + index).each(function(i, obj) {
            explode($(this), size2, w, h);
        });
    })

    $('.svg-letter').mouseleave(function() {
        var index = this.id.replace('letter-', '');
        $('.pixel-' + index).each(function(i, obj) {
            implode($(this), size);
        });
        $('.shadow-' + index).each(function(i, obj) {
            implode($(this), size2);
        });
    })

    var times = [500,750,1000,1250];

    function blockIntro() {
        $('.pixels').each(function(i, obj) {
            var duration = times[Math.floor(Math.random() * times.length)];
            var rect = $(this);
            setTimeout(function() {
                rect.animate({
                    svgX: rect.data('x'),
                    svgY: rect.data('y'),
                }, {duration: duration})
            }, 3 * i);
        });
    }

    blockIntro();
    
});