function consoleLogPlease() {
  console.log("Calling this from attribution_internasl.html");
}

function parseData(advertiser) {
  let data = document.querySelector("#filterTable").model_.rows_;
  data = data.filter((d) => d.destinationOrigin == advertiser);

  //I have the required subset of data

  let all_publishers = data.map((d) => d.sourceOrigin);
  all_publishers = [...new Set(all_publishers)];

  const epochs = [ ... new Set(data.map((d) => d.epoch))];

  let result = [];
  for(let i = 0; i < epochs.length; i++) {
    let epoch = epochs[i];
    let epoch_data = data.filter((d) => d.epoch == epoch);

    let epoch_result = {
      group: "Epoch " + epoch.toString()
    };

    for(let j = 0; j < all_publishers.length; j++) {
      epoch_result[all_publishers[j]] = 0;
    }

    for(let j = 0; j < epoch_data.length; j++) {
      let row = epoch_data[j];
      epoch_result[row.sourceOrigin] += row.consumedBudget;
    }
    result.push(epoch_result);
  }
  console.log(result);
  return result;
};

function putUpGraph(advertiser, div_selector) {
     //"http://arapi-advertiser.localhost"
  const margin = {top: 10, right: 30, bottom: 20, left: 50},
  width = 460 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;
 
 // append the svg object to the body of the page
 const svg = d3.select(div_selector)
   .append("svg")
     .attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom)
   .append("g")
     .attr("transform",`translate(${margin.left},${margin.top})`);
 
 // Parse the Data
  const data = parseData(advertiser);
  
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
     .domain([0, 1]) //
     .range([ height, 0 ]);
   svg.append("g")
     .call(d3.axisLeft(y));
 
   // color palette = one color per subgroup
   const color = d3.scaleOrdinal()
     .domain(subgroups)
     .range(['#C7EFCF','#FE5F55','#EEF5DB'])
 
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
     const subgroupValue = d.data[subgroupName];
     tooltip
         .text(subgroupName + "consumed budget: " + subgroupValue)
         .style("opacity", 1)
 
   }
   const mousemove = function(event, d) {
     tooltip.style("transform","translateY(-55%)")
            .style("left",(event.x)/2+"px")
            .style("top",(event.y)/2-30+"px")
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
}

function showGraphClick() {
  const advertiser = document.querySelector("#advertiser-select").value;
  const div_selector = "#chart-container";
  putUpGraph(advertiser, div_selector);
  console.log("Show Graph Clicked");
}
