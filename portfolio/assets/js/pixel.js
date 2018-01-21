$(function() {

    var p = [
        [1,1,1,1,1,0],
        [1,1,0,0,1,1],
        [1,1,0,0,1,1],
        [1,1,1,1,1,0],
        [1,1,0,0,0,0],
        [1,1,0,0,0,0],
        [1,1,0,0,0,0]
    ];
    var i = [
        [1,1,1,1],
        [0,1,1,0],
        [0,1,1,0],
        [0,1,1,0],
        [0,1,1,0],
        [0,1,1,0],
        [1,1,1,1]
    ];
    var x = [
        [1,1,0,0,0,1],
        [1,1,0,0,0,1],
        [0,1,1,0,1,0],
        [0,0,1,1,0,0],
        [0,1,0,1,1,0],
        [1,0,0,0,1,1],
        [1,0,0,0,1,1],
    ];
    var e = [
        [1,1,1,1,1,1],
        [1,1,0,0,0,0],
        [1,1,0,0,0,0],
        [1,1,1,1,1,0],
        [1,1,0,0,0,0],
        [1,1,0,0,0,0],
        [1,1,1,1,1,1],
    ];
    var l = [
        [1,1,0,0,0,0],
        [1,1,0,0,0,0],
        [1,1,0,0,0,0],
        [1,1,0,0,0,0],
        [1,1,0,0,0,0],
        [1,1,0,0,0,0],
        [1,1,1,1,1,1],
    ];

    var r = [
        [1,1,1,1,1,0],
        [1,1,0,0,1,1],
        [1,1,0,0,1,1],
        [1,1,1,1,1,0],
        [1,1,0,0,1,1],
        [1,1,0,0,1,1],
        [1,1,0,0,1,1]
    ];

    var o = [
        [0,1,1,1,1,0],
        [1,1,0,0,1,1],
        [1,1,0,0,1,1],
        [1,1,0,0,1,1],
        [1,1,0,0,1,1],
        [1,1,0,0,1,1],
        [0,1,1,1,1,0]
    ];

    var t = [
        [1,1,1,1,1,1],
        [0,0,1,1,0,0],
        [0,0,1,1,0,0],
        [0,0,1,1,0,0],
        [0,0,1,1,0,0],
        [0,0,1,1,0,0],
        [0,0,1,1,0,0]
    ];

    var y =[
        [1,1,0,0,0,1],
        [1,1,0,0,0,1],
        [0,1,1,0,1,0],
        [0,0,1,1,0,0],
        [0,0,1,1,0,0],
        [0,0,1,1,0,0],
        [0,0,1,1,0,0]
    ];

    // random colors for animation
    var colors = ['#f08080', '#eaf651', '#ab6d78', '#ffe5fa', '#ffac99', '#f7bedd', '#d8bef7', '#ddf7be'];

    var word = [p,i,x,e,l,p,r,o,p,e,r,t,y];
    var gap = 3;
    var size = 15;
    var square = '';
    var x = 0;
    var y = 0;
    var svgWidth = 6 * size + (5 * gap) + gap;
    var svgHeight = 7 * size + (6 * gap) + gap;

    // make svg canvas per word
    // loop through each letter in word and place rect element where 1
    for (var i = 0; i < word.length; i++) {

        var svgWidth = word[i][0].length * size + ((word[i][0].length - 1) * gap) + gap;
        var svgHeight = word[i].length * size + ((word[i].length - 1) * gap) + gap;

        var elementSvg = '<svg xmlns="http://www.w3.org/2000/svg" data-color="' + colors[i] + '" class="svg-letter" id="letter-' 
            + i + '" width="' + svgWidth + '" height="' + svgHeight + '" style="border:0px solid black; margin:5px;">'
        $('#div-pixels').append(elementSvg);
        for (var j = 0; j < word[i].length; j++) {
            for (var k = 0; k < word[i][j].length; k++) {

                if (word[i][j][k] == 0) {
                    continue; 
                }

                x = k * (size + gap) + (gap / 2);
                y = j * (size + gap) + (gap / 2);
                square = '<rect data-x="' + x + '" data-y="' + y + '"class="pixels rect-' + i 
                            + '" fill="white" x="' + x + '" y="' + (-100) 
                            + '" width="' + size + '" height="' + size + '" style="stroke:black; stroke-width:1"/>';

                $('#letter-' + i).append(square);
            }
        }
    }

    // have to refresh the div when placing svg with jquery
    $("#div-pixels").html($("#div-pixels").html());

    $('.svg-letter').mouseenter(function() {
        var index = this.id;
        index = index.replace('letter-', '');
        var color = colors[Math.floor(Math.random() * colors.length)];
        $(this).children().css({fill: color, transition: '0.5s'});  // random color for animation
        $('.rect-' + index).each(function(i, obj) {
            var x = Math.floor(Math.random() * (svgWidth - size)) + 1;    // -size so it doesnt go outside of svg
            var y = Math.floor(Math.random() * (svgHeight - size)) + 1;
            var rand = Math.floor(Math.random() * 3) + 2;
            $(this).animate({
                svgX: x,
                svgY: y,
                svgWidth: size / rand,
                svgHeight: size / rand,
            }, {duration: 250});
        });
    })

    $('.svg-letter').mouseleave(function() {
        var index = this.id;
        index = index.replace('letter-', '');
        $(this).children().css('fill', 'white');
        $('.rect-' + index).each(function(i, obj) {
            $(this).animate({
                svgX: $(this).data('x'),
                svgY: $(this).data('y'),
                svgWidth: size,
                svgHeight: size
            }, {duration: 250});
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

    setTimeout(blockIntro, 1000);
    
});