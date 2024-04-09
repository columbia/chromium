function formatTime(filetime) {
  const windowsEpochDiff = 11644473600000;
  const milliseconds = (parseInt(filetime) / 1000) - windowsEpochDiff;
  const date = new Date(milliseconds);
  
  // const monthAbbreviations = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  //   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // // Extract day, month, and year components
  // const day = date.getDate().toString().padStart(2, '0');
  // const month = monthAbbreviations[date.getMonth()];
  // const year = date.getFullYear().toString().slice(-2);
  // const formattedDate = day + month + year;

  // Return the formatted date
  return date.toUTCString();
}

function getEpochTag(epoch) {
  return "Epoch " + epoch.toString();
}

function generateToolTip(tool_tip_data, epoch, totalLoss) {
  const f = 2;
  //let tool_tip_text = "User had a privacy loss of " + totalLoss.toFixed(f) + " in " + epoch + " on this advertiser.\n";
  let tool_tip_text = "";
  tool_tip_text += "User had:\n";
  for(let i = 0; i < tool_tip_data.length; i++) {
    tool_tip_text += "(" + (i+1)  + ")" + 
      "Privacy loss of " + tool_tip_data[i].consumedBudget.toFixed(f) + " in epoch " + tool_tip_data[i].epoch +
      " from exposure to this advertiser on " + tool_tip_data[i].sourceOrigin + " at " + formatTime(tool_tip_data[i].sourceTime) +
      " and checkout at " + formatTime(tool_tip_data[i].time) + "\n";
  }
  return tool_tip_text;
}

function parseData(advertiser) {
  let data = document.querySelector("#filterTable").model_.rows_;
  data = data.filter((d) => d.destinationOrigin == advertiser);

  //I have the required subset of data

  let all_checkout_times = data.map((d) => d.time);
  all_checkout_times = [...new Set(all_checkout_times)];

  const epochs = [ ... new Set(data.map((d) => d.epoch))];

  let result = [];
  for(let i = 0; i < epochs.length; i++) {
    let epoch = epochs[i];
    let epoch_data = data.filter((d) => d.epoch == epoch);

    let epoch_result = {
      group: getEpochTag(epoch)
    };

    for(let j = 0; j < all_checkout_times.length; j++) {
      epoch_result[all_checkout_times[j]] = 0;
    }

    for(let j = 0; j < epoch_data.length; j++) {
      let row = epoch_data[j];
      epoch_result[row.time] += row.consumedBudget;
    }
    result.push(epoch_result);
  }
  return {graphdata: result, appendix: data};
};

function putUpGraph(advertiser, div_selector) {
     //"http://advertiser.localhost"
  const margin = {top: 40, right: 30, bottom: 20, left: 50},
  width = 460 - margin.left - margin.right,
  height = 420 - margin.top - margin.bottom;
 
 d3.select(div_selector).select("svg").remove();
 d3.select(div_selector).select("div").remove();

 // append the svg object to the body of the page
 const svg = d3.select(div_selector)
   .append("svg")
     .attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom)
   .append("g")
     .attr("transform",`translate(${margin.left},${margin.top})`);
 
 // Parse the Data
  const all_data = parseData(advertiser);
  const data = all_data.graphdata;

  // List of subgroups = header of the csv files = soil condition here
  const subgroups =  Object.keys(data[0]).slice(1);
 
   // List of groups = species here = value of the first column called group -> I show them on the X axis
  const groups = data.map(d => d.group);
  console.log(groups);
 
   // Add X axis
   const x = d3.scaleBand()
       .domain(groups)
       .range([0, width])
       .padding([0.2])
   svg.append("g")
     .attr("transform", `translate(0, ${height})`)
     .call(d3.axisBottom(x).tickSizeOuter(0));
 
   // Add Y axis
   const y = d3.scaleLinear()
     .domain([0, 2]) //
     .range([ height, 0 ]);
   svg.append("g")
     .call(d3.axisLeft(y));
 
   // color palette = one color per subgroup
   //Visibly distinct 20 colors generated from https://mokole.com/palette.html
   const color = d3.scaleOrdinal()
     .domain(subgroups)
     .range(['#ffe4c4','#87cefa','#dda0dd', '#98fb98', '#ff1493', 
        '#1e90ff', '#ff00ff', '#f08080', '#00ffff', '#ba55d3',
        '#7fff00', '#0000cd', '#ffff00', '#ffa500', '#ff4500',
        '#696969', '#2e8b57', '#7f0000', '#191970', '#808000'])
 
   //stack the data? --> stack per subgroup
   const stackedData = d3.stack()
     .keys(subgroups)
     (data)

   // ----------------
   // Create a tooltip
   // ----------------
   const tooltip = d3.select(div_selector)
     .append("div")
     .style("opacity", 0)
     .attr("class", "tooltip")
     .style("background-color", "white")
     .style("border", "solid")
     .style("border-width", "1px")
     .style("border-radius", "5px")
     .style("padding", "10px")
 
   // Three function that change the tooltip when user hover / move / leave a cell
   const mouseover = function(event, d) {
     const subgroupName = d3.select(this.parentNode).datum().key;
     console.log("Subgroup Name: " + subgroupName)
     console.log("Data: ");
     console.log(d.data);
     console.log("End Data");
     const subgroupValue = d.data[subgroupName];

     const tool_tip_data = all_data.appendix.filter((d) => d.time == subgroupName);
     tooltip
         .text(generateToolTip(tool_tip_data, d.data.group, subgroupValue))
         .style("opacity", 1)
         .style("position", "absolute")

 
   }
   const mousemove = function(event, d) {
     tooltip.style("transform","translateY(-55%)")
            .style("left",(event.x)/2+"px")
            .style("top", (event.y - 40) + "px")
            //.style("width", "600px")
   }
   const mouseleave = function(event, d) {
     tooltip
       .style("opacity", 0)
   }
 
   // Show the bars
   svg.append("g")
     .selectAll("g")
     // Enter in the stack data = loop key per key = group per group
     .data(stackedData)
     .join("g")
       .attr("fill", d => color(d.key))
       .selectAll("rect")
       // enter a second time = loop subgroup per subgroup to add all rectangles
       .data(d => d)
       .join("rect")
         .attr("x", d =>  x(d.data.group))
         .attr("y", d => y(d[1]))
         .attr("height", d => y(d[0]) - y(d[1]))
         .attr("width",x.bandwidth())
         .attr("stroke", "grey")
       .on("mouseover", mouseover)
       .on("mousemove", mousemove)
       .on("mouseleave", mouseleave)

    svg.append("text")
       .attr("x", width / 2) // Adjust position as needed
       .attr("y", margin.top/2) // Adjust position as needed
       .attr("text-anchor", "middle") // Center align the text
       .style("font-size", "14px") // Set font size
       .style("font-weight", "bold") // Set font weight
       .text(advertiser);
}

function showGraphClick() {
  const advertiser = document.querySelector("#advertiser-select").value;
  const div_selector = "#chart-container";
  putUpGraph(advertiser, div_selector);
  console.log("Show Graph Clicked");
}
