// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG containers for both charts
const average_precipitation_line_plot = d3.select("#lineChart1")
	.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

const avg_temp_line_plot = d3.select("#lineChart2")
	.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

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
	
	// 8.a: ADD INTERACTIVITY FOR CHART 1
	
	// Create Checkboxes
	const checkboxContainer = d3.select("#city-checkboxes");
	const allCities = [...cityGroups.keys()];
	
	allCities.forEach(city => {
		const label = checkboxContainer.append("label").style("margin-right", "10px");
		label.append("input")
			.attr("type", "checkbox")
			.attr("checked", true)
			.attr("value", city)
			.on("change", updateChart);
		label.append("span").text(city);
	});
	
	// Tooltip
	const tooltip = d3.select("body").append("div")
		.style("position", "absolute")
		.style("padding", "6px")
		.style("background", "#eee")
		.style("border", "1px solid #ccc")
		.style("border-radius", "4px")
		.style("pointer-events", "none")
		.style("opacity", 0);
	
	// Chart Update Function for Chart 1
	function updateChart() {
		const checkedCities = [];
		d3.selectAll("#city-checkboxes input").each(function() {
			if (this.checked) checkedCities.push(this.value);
		});
		
		// Show all if none or all selected
		const citiesToShow = (checkedCities.length === 0 || checkedCities.length === allCities.length)
			? allCities
			: checkedCities;
		
		const filteredData = [...cityGroups.entries()].filter(([city]) => citiesToShow.includes(city));
		
		const lines = average_precipitation_line_plot.selectAll(".line")
			.data(filteredData, d => d[0]);
		
		lines.join(
			enter => enter.append("path")
				.attr("class", "line")
				.attr("fill", "none")
				.attr("stroke", ([city]) => colorScale(city))
				.attr("stroke-width", 2)
				.attr("d", ([, values]) => line(values))
				.on("mouseover", function (event, [city]) {
					d3.select(this).attr("stroke-width", 4);
					tooltip.style("opacity", 1).html(`City: <strong>${city}</strong>`);
				})
				.on("mousemove", function (event) {
					tooltip
						.style("left", (event.pageX + 10) + "px")
						.style("top", (event.pageY - 20) + "px");
				})
				.on("mouseout", function () {
					d3.select(this).attr("stroke-width", 2);
					tooltip.style("opacity", 0);
				}),
			update => update
				.attr("stroke", ([city]) => colorScale(city))
				.attr("d", ([, values]) => line(values)),
			exit => exit.remove()
		);
	}
	
	updateChart();
	
	// ==========================================
	//                 CHART 2
	// ==========================================
	
	const phoenixData = data.filter(d => d.city === "Phoenix");
	
	const monthlyAVG = d3.groups(phoenixData, d => d.date.getMonth() + 1)
		.map(([month, values]) => ({
			month: +month,
			avgTemp: d3.mean(values, d => d.actual_mean_temp)
		}));
	
	monthlyAVG.forEach(d => {
		d.adjustedMonth = (d.month + 5) % 12;
	});
	
	monthlyAVG.sort((a, b) => a.adjustedMonth - b.adjustedMonth);
	
	// 3.b: SET SCALES FOR CHART 2
	const xScale2 = d3.scaleLinear()
		.domain([0, 11])
		.range([0, width]);
	
	const yScale2 = d3.scaleLinear()
		.domain([
			d3.min(monthlyAVG, d => d.avgTemp) * 0.95,
			d3.max(monthlyAVG, d => d.avgTemp) * 1.05
		])
		.range([height, 0]);
	
	// 4.b: PLOT DATA FOR CHART 2
	const line2 = d3.line()
		.x(d => xScale2(d.adjustedMonth))
		.y(d => yScale2(d.avgTemp));
	
	avg_temp_line_plot.append("path")
		.datum(monthlyAVG)
		.attr("class", "line")
		.attr("d", line2)
		.attr("fill", "none")
		.attr("stroke", "steelblue")
		.attr("stroke-width", 2);
	
	// 5.b: ADD AXES FOR CHART 2
	const months_2014_2015 = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
	
	const xAxis2 = d3.axisBottom(xScale2)
		.ticks(12)
		.tickFormat(d => months_2014_2015[d]);
	
	avg_temp_line_plot.append("g")
		.attr("class", "x-axis")
		.attr("transform", `translate(0, ${height})`)
		.call(xAxis2);
	
	avg_temp_line_plot.append("g")
		.attr("class", "y-axis")
		.call(d3.axisLeft(yScale2));
	
	// 6.b: ADD LABELS FOR CHART 2
	avg_temp_line_plot.append("text")
		.attr("x", width / 2)
		.attr("y", height + 50)
		.attr("text-anchor", "middle")
		.style("fill", "black")
		.style("font-size", "14px")
		.text("Months (2014-2015)");
	
	avg_temp_line_plot.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", -height / 2)
		.attr("y", -50)
		.attr("text-anchor", "middle")
		.style("fill", "black")
		.style("font-size", "14px")
		.text("Avg Actual Mean Temp (°F)");
	
    // 7.b: (Optional) ADD INTERACTIVITY FOR CHART 2
    // (Add any tooltip or interactivity code here if desired.) });
	const select = d3.select("#city-selector");
	
	allCities.forEach(city => {
		select.append("option")
			.attr("value", city)
			.text(city);
	});
	
	select.on("change", updateChart2);
	
	function updateChart2() {
		const selectedCity = d3.select("#city-selector").property("value");
		
		d3.selectAll(".chart-container")
			.filter(function(d, i) { return i === 1; })
			.select("h2")
			.text(`Average Actual Mean Temperature Over Time in ${selectedCity}`);
		
		const cityData = data.filter(d => d.city === selectedCity);
		
		const monthlyAVG2 = d3.groups(cityData, d => d.date.getMonth() + 1)
			.map(([month, values]) => ({
				month: +month,
				avgTemp: d3.mean(values, d => d.actual_mean_temp)
			}));
		
		monthlyAVG2.forEach(d => {
			d.adjustedMonth = (d.month + 5) % 12;
		});
		
		monthlyAVG2.sort((a, b) => a.adjustedMonth - b.adjustedMonth);
		
		yScale2.domain([
			d3.min(monthlyAVG2, d => d.avgTemp) * 0.95,
			d3.max(monthlyAVG2, d => d.avgTemp) * 1.05
		]);
		
		avg_temp_line_plot.selectAll(".line")
			.datum(monthlyAVG2)
			.transition()
			.duration(1000)
			.attr("d", line2);
		
		avg_temp_line_plot.select(".y-axis")
			.transition()
			.duration(1000)
			.call(d3.axisLeft(yScale2));
	}
});