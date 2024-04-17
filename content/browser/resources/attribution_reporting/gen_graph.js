const normal_width = 1;
const hover_width = 3;
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
  return date.toDateString();
}

function getEpochTag(epoch) {
  switch (epoch) {
    case 1n:
      return "Mar 18-24 '24";
    case 2n:
      return "Mar 25-31 '24";
    case 3n:
      return "Apr 1-7 '24";
    case 4n:
      return "Apr 8-14 '24";
    default:
      return "INVALID EPOCH";
  }
}

function generateToolTip(tool_tip_data, epoch, totalLoss) {
  if(tool_tip_data.length <= 0)
    return "";
  const f = 2;
  //let tool_tip_text = "User had a privacy loss of " + totalLoss.toFixed(f) + " in " + epoch + " on this advertiser.\n";
  let tool_tip_text = "";
  tool_tip_text += "On " + formatTime(tool_tip_data[0].time - (47n * 3600n * 1000000n)) + ", you converted on " + 
                  tool_tip_data[0].destinationOrigin + ". <br> <br>This resulted in a privacy loss of " + totalLoss + 
                  " against this site due to attributed impression on " + tool_tip_data[0].sourceOrigin + " on " + 
                  formatTime(tool_tip_data[0].sourceTime - (4n - tool_tip_data[0].epoch) * 7n * 24n * 3660n * 1000000n - 72n * 3600n * 1000000n) + 
                  "<br>";

  // tool_tip_text += "<br><em>Note: Your browser is capping your privacy loss against this site to 1 within each window of time; ";
  // tool_tip_text += "this offers a generally acceptable level of privacy protection.</em>";
  return tool_tip_text;
}

function parseData(advertiser) {
  let data = document.querySelector("#filterTable").model_.rows_;
  data.forEach(row => {
    row.destinationOrigin = row.destinationOrigin.replace("http://advertiser", "nike");
    row.sourceOrigin = row.sourceOrigin.replace("http://publisher", "nytimes");
  });

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
  const margin = {top: 60, right: 30, bottom: 20, left: 50},
  width = 460 - margin.left - margin.right,
  height = 450 - margin.top - margin.bottom;
 
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
       .padding([0.3])
   svg.append("g")
     .attr("transform", `translate(0, ${height})`)
     .call(d3.axisBottom(x).tickSizeOuter(0))
     .style("font-size", "12px");
 
   // Add Y axis
   const y = d3.scaleLinear()
     .domain([0, 1]) //
     .range([ height, 0 ]);
   svg.append("g")
     .call(d3.axisLeft(y))
     .style("font-size", "12px");
 
   // color palette = one color per subgroup
   //Visibly distinct 20 colors generated from https://mokole.com/palette.html
   const color = d3.scaleOrdinal()
     .domain(subgroups)
     .range([ '#97afc7' ])
     //.range(['#b84c7d','#50b47b','#8650a6', '#86a542', '#6881d8', 
     //   '#c18739', '#b84c3e', '#f95d6a'])
 
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
     .style("width", "250px")
     .style("font-size", "16px") // Set font size
     .style("z-index", 999)

 
   // Three function that change the tooltip when user hover / move / leave a cell
   const mouseover = function(event, d) {
      d3.select(this).attr("stroke-width", hover_width);

    import("//resources/js/static_types.js").then((mod) => {
      console.log("Hello!");
      const subgroupName = d3.select(this.parentNode).datum().key;
      console.log("Subgroup Name: " + subgroupName)
      console.log("Data: ");
      console.log(d.data);
      console.log("End Data");
      const subgroupValue = d.data[subgroupName];
    
      const tool_tip_data = all_data.appendix.filter((row) => row.time == subgroupName && d.data.group == getEpochTag(row.epoch));
      tooltip
           .html(mod.getTrustedHTML(generateToolTip(tool_tip_data, d.data.group, subgroupValue)))    
          // .html()
          .style("opacity", 1)
          .style("position", "absolute")
    });
   }

   const mousemove = function(event, d) {
     tooltip.style("transform","translateY(-55%)")
            .style("left", (event.x - 150) +"px")
            .style("top", ((event.y/2) + 80) + "px")
            //.style("width", "600px")
   }
   const mouseleave = function(event, d) {
    d3.select(this).attr("stroke-width", normal_width);
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
         .attr("stroke", "black")
         .attr("stroke-width", normal_width) // Border width
       .on("mouseover", mouseover)
       .on("mousemove", mousemove)
       .on("mouseleave", mouseleave)

    svg.append("text")
       .attr("x", width / 2) // Adjust position as needed
       .attr("y", "-10px") // Adjust position as needed
       .attr("text-anchor", "middle") // Center align the text
       .style("font-size", "14px") // Set font size
       .style("font-weight", "bold") // Set font weight
       .text("Advertiser: " + advertiser);
}

function showGraphClick() {
  const advertiser = document.querySelector("#advertiser-select").value;
  const div_selector = "#chart-container";
  putUpGraph(advertiser, div_selector);
  console.log("Show Graph Clicked");
}
