var div = d3.select("body").append("div").attr("class", "toolTip");

var dataset = [
    { label: 'Carrier', total: 25234, percent: 44.6 },
    { label: 'Weather', total: 15639, percent: 27.7 },
    { label: 'National Air System', total: 15639, percent: 27.7 },
    { label: 'Security', total: 22, percent: 0.0003 }
];

// legend dimensions
// var legendRectSize = 25; // defines the size of the colored squares in legend
// var legendSpacing = 6; // defines spacing between squares

var width = 960,
    height = 500,
    radius = Math.min(width, height) / 2;

var color = d3.scale.ordinal()
    .range(["#009FFF", "#FF3F00", "#FFBF00", "#029F00"]);

var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 70);

var pie = d3.layout.pie()
    .sort(null)
    .startAngle(1.1 * Math.PI)
    .endAngle(3.1 * Math.PI)
    .value(function (d) { return d.total; });

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


var g = svg.selectAll(".arc")
    .data(pie(dataset))
    .enter().append("g")
    .attr("class", "arc");

g.append("path")
    .style("fill", function (d) { return color(d.data.label); })
    .transition().delay(function (d, i) {
        return i * 500;
    }).duration(500)
    .attrTween('d', function (d) {
        var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
        return function (t) {
            d.endAngle = i(t);
            return arc(d)
        }
    });
g.append("text")
    .attr("transform", function (d) { return "translate(" + arc.centroid(d) + ")"; })
    .attr("dy", ".35em")
    .transition()
    .delay(1000)
    .text(function (d) { return d.data.label; });

d3.selectAll("path").on("mousemove", function (d) {
    div.style("left", d3.event.pageX + 10 + "px");
    div.style("top", d3.event.pageY - 25 + "px");
    div.style("display", "inline-block");
    div.html((d.data.label) + "<br>" + (d.data.total) + "<br>" + (d.data.percent) + "%");
});

d3.selectAll("path").on("mouseout", function (d) {
    div.style("display", "none");
});


//d3.select("body").transition().style("background-color", "#d3d3d3");
function type(d) {
    d.total = +d.total;
    return d;
}

// define Legend
// var legend = svg.selectAll('.legend') // selecting elements with class 'legend'
//     .data(color.domain()) // refers to an array of labels from our dataset
//     .enter() // creates placeholder
//     .append('g') // replace placeholders with g elements
//     .attr('class', 'legend') // each g is given a legend class
//     .attr('transform', function (d, i) {
//         var height = legendRectSize + legendSpacing; // height of element is the height of the colored square plus the spacing      
//         var offset = height * color.domain().length / 2; // vertical offset of the entire legend = height of a single element & half the total number of elements  
//         var horz = 18 * legendRectSize; // the legend is shifted to the left to make room for the text
//         var vert = i * height - offset; // the top of the element is hifted up or down from the center using the offset defiend earlier and the index of the current element 'i'               
//         return 'translate(' + horz + ',' + vert + ')'; //return translation       
//     });

// // adding colored squares to legend
// legend.append('rect') // append rectangle squares to legend                                   
//     .attr('width', legendRectSize) // width of rect size is defined above                        
//     .attr('height', legendRectSize) // height of rect size is defined above                      
//     .style('fill', color) // each fill is passed a color
//     .style('stroke', color) // each stroke is passed a color
//     .on('click', function (label) {
//         var rect = d3.select(this); // this refers to the colored squared just clicked
//         var enabled = true; // set enabled true to default
//         var totalEnabled = d3.sum(dataset.map(function (d) { // can't disable all options
//             return (d.enabled) ? 1 : 0; // return 1 for each enabled entry. and summing it up
//         }));

//         if (rect.attr('class') === 'disabled') { // if class is disabled
//             rect.attr('class', ''); // remove class disabled
//         } else { // else
//             if (totalEnabled < 2) return; // if less than two labels are flagged, exit
//             rect.attr('class', 'disabled'); // otherwise flag the square disabled
//             enabled = false; // set enabled to false
//         }

//         pie.value(function (d) {
//             if (d.label === label) d.enabled = enabled; // if entry label matches legend label
//             return (d.enabled) ? d.total : 0; // update enabled property and return count or 0 based on the entry's status
//         });

//         path = path.data(pie(dataset)); // update pie with new data

//         path.transition() // transition of redrawn pie
//             .duration(750) // 
//             .attrTween('d', function (d) { // 'd' specifies the d attribute that we'll be animating
//                 var interpolate = d3.interpolate(this._current, d); // this = current path element
//                 this._current = interpolate(0); // interpolate between current value and the new value of 'd'
//                 return function (t) {
//                     return arc(interpolate(t));
//                 };
//             });
//     });

// // adding text to legend
// legend.append('text')
//     .attr('x', legendRectSize + legendSpacing)
//     .attr('y', legendRectSize - legendSpacing)
//     .text(function (d) { return d; });