$(function() {

    var p = [
        [0,0,0,0,0,0,0,0],
        [0,1,1,1,1,1,0,0],
        [0,1,1,0,0,1,1,0],
        [0,1,1,0,0,1,1,0],
        [0,1,1,1,1,1,0,0],
        [0,1,1,0,0,0,0,0],
        [0,1,1,0,0,0,0,0],
        [0,1,1,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
    ];
    var i = [
        [0,0,0,0,0,0],
        [0,1,1,1,1,0],
        [0,0,1,1,0,0],
        [0,0,1,1,0,0],
        [0,0,1,1,0,0],
        [0,0,1,1,0,0],
        [0,0,1,1,0,0],
        [0,1,1,1,1,0],
        [0,0,0,0,0,0],
    ];
    var x = [
        [0,0,0,0,0,0,0,0],
        [0,1,1,0,0,0,1,0],
        [0,1,1,0,0,0,1,0],
        [0,0,1,1,0,1,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,1,0,1,1,0,0],
        [0,1,0,0,0,1,1,0],
        [0,1,0,0,0,1,1,0],
        [0,0,0,0,0,0,0,0],
    ];
    var e = [
        [0,0,0,0,0,0,0,0],
        [0,1,1,1,1,1,1,0],
        [0,1,1,0,0,0,0,0],
        [0,1,1,0,0,0,0,0],
        [0,1,1,1,1,1,0,0],
        [0,1,1,0,0,0,0,0],
        [0,1,1,0,0,0,0,0],
        [0,1,1,1,1,1,1,0],
        [0,0,0,0,0,0,0,0],
    ];
    var l = [
        [0,0,0,0,0,0,0,0],
        [0,1,1,0,0,0,0,0],
        [0,1,1,0,0,0,0,0],
        [0,1,1,0,0,0,0,0],
        [0,1,1,0,0,0,0,0],
        [0,1,1,0,0,0,0,0],
        [0,1,1,0,0,0,0,0],
        [0,1,1,1,1,1,1,0],
        [0,0,0,0,0,0,0,0],
    ];

    var r = [
        [0,0,0,0,0,0,0,0],
        [0,1,1,1,1,1,0,0],
        [0,1,1,0,0,1,1,0],
        [0,1,1,0,0,1,1,0],
        [0,1,1,1,1,1,0,0],
        [0,1,1,0,0,1,1,0],
        [0,1,1,0,0,1,1,0],
        [0,1,1,0,0,1,1,0],
        [0,0,0,0,0,0,0,0],
    ];

    var o = [
        [0,0,0,0,0,0,0,0],
        [0,0,1,1,1,1,0,0],
        [0,1,1,0,0,1,1,0],
        [0,1,1,0,0,1,1,0],
        [0,1,1,0,0,1,1,0],
        [0,1,1,0,0,1,1,0],
        [0,1,1,0,0,1,1,0],
        [0,0,1,1,1,1,0,0],
        [0,0,0,0,0,0,0,0],
    ];

    var t = [
        [0,0,0,0,0,0,0,0],
        [0,1,1,1,1,1,1,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,0,0,0,0,0],
    ];

    var y =[
        [0,0,0,0,0,0,0,0],
        [0,1,1,0,0,0,1,0],
        [0,1,1,0,0,0,1,0],
        [0,0,1,1,0,1,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,0,0,0,0,0],
    ];

    var divs    = ['#div-pixel','#div-property'];
    var words   = [[p,i,x,e,l],[p,r,o,p,e,r,t,y]];
    var gap     = 0;
    var size    = 12;
    var size2   = size + 10;
    var square  = '';
    var x       = 0;
    var y       = 0;
    var svgWidth  = 6 * size + (5 * gap) + gap;
    var svgHeight = 7 * size + (6 * gap) + gap;

    // generate shadow pixels first b/c of how svg rects stack
    for (var w = 0; w < words.length; w++) {
        for (var i = 0; i < words[w].length; i++) {
            var svgWidth    = words[w][i][0].length * size + ((words[w][i][0].length - 1)   * gap) + gap;
            var svgHeight   = words[w][i].length    * size + ((words[w][i].length - 1)      * gap) + gap;
            var elementSvg  = '<svg xmlns="http://www.w3.org/2000/svg" class="svg-letter" id="letter-' + (w + '' + i) 
                                + '" width="' + svgWidth + '" height="' + svgHeight + '" style="margin:5px;">'
            $(divs[w]).append(elementSvg);
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
                            + '" fill="black" x="' + x + '" y="' + (-100) 
                            + '" width="' + size2 + '" height="' + size2 + '" style="stroke:black; stroke-width:1"/>';
                    $('#letter-' + (w + '' + i)).append(square);                            
                }
            }
        }
    }
    // generate white pixels
    for (var w = 0; w < words.length; w++) {
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
                    square = '<rect data-x="' + x + '" data-y="' + y + '"class="pixels rect-' + (w + '' + i) 
                            + '" fill="white" x="' + x + '" y="' + (-100) 
                            + '" width="' + size + '" height="' + size + '" style="z-index: 100; stroke:white; stroke-width:1"/>';
                    $('#letter-' + (w + '' + i)).append(square);
                }
            }
        }
    }

    // have to refresh the div when placing svg with jquery
    $("#header").html($("#header").html());

    function explode(element, elementSize) {
        element.clearQueue();
        var x = Math.floor(Math.random() * (svgWidth - elementSize)) + 1;
        var y = Math.floor(Math.random() * (svgHeight - elementSize)) + 1;
        var rand = Math.floor(Math.random() * 3) + 2;
        element.animate({
            svgX: x,
            svgY: y,
            svgWidth: elementSize / rand,
            svgHeight: elementSize / rand
        }, {duration: 250});
    }

    function implode(element, elementSize) {
        element.animate({
                svgX: element.data('x'),
                svgY: element.data('y'),
                svgWidth: elementSize,
                svgHeight: elementSize
        }, {duration: 250});
    }

    $('.svg-letter').mouseenter(function() {
        var index = this.id.replace('letter-', '');
        $('.rect-' + index).each(function(i, obj) {
            explode($(this), size);
        });
        $('.shadow-' + index).each(function(i, obj) {
            explode($(this), size2);
        });
    })

    $('.svg-letter').mouseleave(function() {
        var index = this.id.replace('letter-', '');
        $('.rect-' + index).each(function(i, obj) {
            implode($(this), size);
        });
        $('.shadow-' + index).each(function(i, obj) {
            implode($(this), size2);
        });
    })

    var times = [500,550,600,650,700,750,800,850,900,950,1000,1050,1100,1150,1200,1250];

    function blockIntro() {
        $('.pixels').each(function(i, obj) {
            var duration = times[Math.floor(Math.random() * times.length)];
            $(this).animate({
                svgX: $(this).data('x'),
                svgY: $(this).data('y'),
            }, {duration: duration});
        });
    }
    
    setTimeout(blockIntro, 1500);
    
});