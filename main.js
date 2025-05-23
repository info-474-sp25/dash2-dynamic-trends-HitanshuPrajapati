// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG containers for both charts
const average_precipitation_line_plot = d3.select("#lineChart1") // If you change this ID, you must change it in index.html too
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const svg2_RENAME = d3.select("#lineChart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// (If applicable) Tooltip element for interactivity
// const tooltip = ...

// 2.a: LOAD...
d3.csv("weather.csv").then(data => {
    
    // 2.b: ... AND TRANSFORM DATA

    // Turn date strings into Date objects and precipitation values to numbers
    data.forEach(d => {
        d.date = d3.timeParse("%m/%d/%Y")(d.date);
        d.average_precipitation = +d.average_precipitation;
    });

    // Group data by city
    const cityGroups = d3.group(data, d => d.city);

    // 3.a: SET SCALES FOR CHART 1
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.average_precipitation)])
        .range([height, 0]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain([...cityGroups.keys()]);

    // 4.a: PLOT DATA FOR CHART 1
    const line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.average_precipitation));

    average_precipitation_line_plot.selectAll(".line")
        .data(cityGroups)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("d", ([, values]) => line(values))
        .attr("fill", "none")
        .attr("stroke", ([city]) => colorScale(city))
        .attr("stroke-width", 2);


    // 5.a: ADD AXES FOR CHART 1
    const formatMonthYear = d3.timeFormat("%b %Y");

    average_precipitation_line_plot.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale).tickFormat(formatMonthYear));


    average_precipitation_line_plot.append("g")
        .call(d3.axisLeft(yScale));


    // 6.a: ADD LABELS FOR CHART 1
    average_precipitation_line_plot.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .style("fill", "black")
        .style("font-size", "14px")
        .text("Date");

    average_precipitation_line_plot.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .style("fill", "black")
        .style("font-size", "14px")
        .text("Avg Precipitation (inches / hr)");

    // 7.a: ADD STATIC LEGEND (TEMPORARY UNTIL INTERACTIVITY IS ADDED)
    const legend = average_precipitation_line_plot.selectAll(".legend")
        .data([...cityGroups.keys()])
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${i * 120 + 50}, ${-40})`);  // i * spacing, y = below chart

    legend.append("rect")
        .attr("x", 0)
        .attr("width", 12)
        .attr("height", 12)
        .style("fill", d => colorScale(d));

    legend.append("text")
        .attr("x", 18)  // spacing between rect and text
        .attr("y", 6)  // center vertically with rect
        .attr("dy", "0.35em")
        .style("text-anchor", "start")
        .style("font-size", "12px")
        .text(d => d);




    // 8.a: ADD INTERACTIVITY FOR CHART 1
    

    // ==========================================
    //         CHART 2 (if applicable)
    // ==========================================

    // 3.b: SET SCALES FOR CHART 2


    // 4.b: PLOT DATA FOR CHART 2


    // 5.b: ADD AXES FOR CHART 


    // 6.b: ADD LABELS FOR CHART 2


    // 7.b: ADD INTERACTIVITY FOR CHART 2


});
