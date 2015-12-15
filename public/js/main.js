(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define('spectraVis', ['exports'], factory) :
  factory((global.spectraVis = {}));
}(this, function (exports) { 'use strict';

  function copyObject(obj) {
    var newObj = {};
    for (var key in obj) {
      // Copy all the fields
      newObj[key] = obj[key];
    }

    return newObj;
  }

  function edgeFilterWithin(e) {
    var showEdge = (e.source.region === e.target.region);
    return showEdge;
  }

  function edgeFilterBetween(e) {
    var showEdge = (e.source.region !== e.target.region);
    return showEdge;
  }

  function binaryNetworkFilter(e) {
    return e.data !== 0;
  }

  function networkDataManager() {

    var edgeData;
    var channelData;
    var networkData;
    var isWeighted;
    var aspectRatio;
    var isFixed;
    var imageLink;
    var curTimeInd;
    var curFreqInd;
    var edgeStatID;
    var subjectID;
    var networkView;
    var times;
    var frequencies;
    var curTime;
    var curFreq;
    var edgeStatDomain;
    var edgeFilterType;
    var edges;
    var nodes;
    var brainXLim;
    var brainYLim;
    var dispatch = d3.dispatch('dataReady', 'networkChange');
    var dataManager = {};

    dataManager.loadNetworkData = function() {
      var edgeFile = 'edges_' + subjectID + '_' + edgeStatID + '.json';
      var channelFile = 'channels_' + subjectID + '.json';

      // Load subject data
      queue()
        .defer(d3.json, 'DATA/' + edgeFile)
        .defer(d3.json, 'DATA/' + channelFile)
        .await(function(error, edge, channel) {
          // Preprocess
          channelData = channel.map(function(n) {
            n.fixedX = n.x;
            n.fixedY = n.y;
            n.x = undefined;
            n.y = undefined;
            n.fixed = false;
            return n;
          });

          nodes = channelData.map(function(n) {
            var obj = copyObject(n);
            return obj;
          });

          // Replace source name by source object
          edgeData = edge.map(function(e) {
            e.source = nodes.filter(function(n) {
              return n.channelID === e.source;
            })[0];

            e.target = nodes.filter(function(n) {
              return n.channelID === e.target;
            })[0];

            return e;
          });

          dataManager.filterNetworkData();
        });

      dispatch.dataReady();

      return dataManager;
    };

    dataManager.filterNetworkData = function() {

      isFixed = (networkView.toUpperCase() === 'ANATOMICAL');
      imageLink = isFixed ? 'DATA/brainImages/brainImage_' + subjectID + '.png' : '';
      curTimeInd = times.indexOf(curTime);
      curTimeInd = (curTimeInd === -1) ? 0 : curTimeInd;
      curFreqInd = frequencies.indexOf(curFreq);
      curFreqInd = (curFreqInd === -1) ? 0 : curFreqInd;

      // Get the network for the current time and frequency
      edges = edgeData.map(function(e) {
        var obj = copyObject(e);
        obj.data = e.data[curTimeInd][curFreqInd];
        return obj;
      });

      // Filter by connections within or between brain regions
      var edgeFilterByConnection = {
        Within: edgeFilterWithin,
        Between: edgeFilterBetween,
        All: function() {return true;},

        undefined: function() {return true;},
      };

      // For binary networks, don't display edges equal to zero
      var networkTypeFilter = isWeighted ? function() {return true;} : binaryNetworkFilter;

      edges = edges.filter(networkTypeFilter);

      // Add in any missing edges
      edges = edges.filter(edgeFilterByConnection[edgeFilterType]);

      if (isFixed) {
        nodes.forEach(function(n) {
          n.x = undefined;
          n.y = undefined;
          n.px = undefined;
          n.py = undefined;
          n.fixed = true;
        });
      } else {
        var nodesData = d3.selectAll('.gnode').data();
        nodes.forEach(function(n) {
          var correspondingNode = nodesData.filter(function(m) {
            return m.channelID === n.channelID;
          })[0];

          if (typeof correspondingNode === 'undefined') {
            n.x = undefined;
            n.y = undefined;
            n.px = undefined;
            n.py = undefined;
          } else {
            n.x = correspondingNode.x;
            n.y = correspondingNode.y;
            n.px = correspondingNode.px;
            n.py = correspondingNode.py;
          }

          n.fixed = false;
        });
      };

      networkData = {
        nodes: nodes,
        edges: edges,
      };

      dispatch.networkChange();

      return dataManager;
    };

    dataManager.isWeighted = function(value) {
      if (!arguments.length) return isWeighted;
      isWeighted = value;
      return dataManager;
    };

    dataManager.aspectRatio = function(value) {
      if (!arguments.length) return aspectRatio;
      aspectRatio = value;
      return dataManager;
    };

    dataManager.brainXLim = function(value) {
      if (!arguments.length) return brainXLim;
      brainXLim = value;
      return dataManager;
    };

    dataManager.brainYLim = function(value) {
      if (!arguments.length) return brainYLim;
      brainYLim = value;
      return dataManager;
    };

    dataManager.isFixed = function(value) {
      if (!arguments.length) return isFixed;
      isFixed = value;
      return dataManager;
    };

    dataManager.imageLink = function(value) {
      if (!arguments.length) return imageLink;
      imageLink = value;
      return dataManager;
    };

    dataManager.curTimeInd = function(value) {
      if (!arguments.length) return curTimeInd;
      curTimeInd = value;
      return dataManager;
    };

    dataManager.curFreqInd = function(value) {
      if (!arguments.length) return curFreqInd;
      curFreqInd = value;
      return dataManager;
    };

    dataManager.edgeStatID = function(value) {
      if (!arguments.length) return edgeStatID;
      edgeStatID = value;
      return dataManager;
    };

    dataManager.subjectID = function(value) {
      if (!arguments.length) return subjectID;
      subjectID = value;
      return dataManager;
    };

    dataManager.networkView = function(value) {
      if (!arguments.length) return networkView;
      networkView = value;
      return dataManager;
    };

    dataManager.times = function(value) {
      if (!arguments.length) return times;
      times = value;
      return dataManager;
    };

    dataManager.frequencies = function(value) {
      if (!arguments.length) return frequencies;
      frequencies = value;
      return dataManager;
    };

    dataManager.curTime = function(value) {
      if (!arguments.length) return curTime;
      curTime = value;
      return dataManager;
    };

    dataManager.curFreq = function(value) {
      if (!arguments.length) return curFreq;
      curFreq = value;
      return dataManager;
    };

    dataManager.edgeStatDomain = function(value) {
      if (!arguments.length) return edgeStatDomain;
      edgeStatDomain = value;
      return dataManager;
    };

    dataManager.edgeFilterType = function(value) {
      if (!arguments.length) return edgeFilterType;
      edgeFilterType = value;
      return dataManager;
    };

    dataManager.edges = function(value) {
      if (!arguments.length) return edges;
      edges = value;
      return dataManager;
    };

    dataManager.networkData = function(value) {
      if (!arguments.length) return networkData;
      networkData = value;
      return dataManager;
    };

    d3.rebind(dataManager, dispatch, 'on');

    return dataManager;

  }

  function drawNodes () {

    var nodeColor = function() {return 'grey';};

    var nodeRadius = 10;

    function chart(selection) {
      selection.each(function(data) {
        var nodeCircle = d3.select(this).selectAll('circle.node').data([data]);

        nodeCircle.enter()
          .append('circle')
          .attr('class', 'node')
          .attr('opacity', 1);
        nodeCircle
          .attr('r', nodeRadius)
          .attr('fill', function(d) {
            return nodeColor(d.region);
          })
          .style('stroke', 'white');

        var nodeText = d3.select(this).selectAll('text.nodeLabel').data([data]);

        nodeText.enter()
          .append('text')
          .attr('class', 'nodeLabel');
        nodeText
          .text(function(d) {
            return d.channelID;
          });
      });
    };

    chart.nodeColor = function(value) {
      if (!arguments.length) return nodeColor;
      nodeColor = value;
      return chart;
    };

    chart.nodeRadius = function(value) {
      if (!arguments.length) return nodeRadius;
      nodeRadius = value;
      return chart;
    };

    return chart;
  }

  function insertImage(imageLink, imageSelection) {
    if (imageLink === '') return;
    getImageBase64(imageLink, function(error, d) {
      imageSelection
        .attr('xlink:href', 'data:image/png;base64,' + d);
    });
  }

  function converterEngine(input) { // fn BLOB => Binary => Base64 ?
    var uInt8Array = new Uint8Array(input);
    var i = uInt8Array.length;
    var biStr = []; //new Array(i);
    while (i--) {
      biStr[i] = String.fromCharCode(uInt8Array[i]);
    }

    var base64 = window.btoa(biStr.join(''));
    return base64;
  };

  function getImageBase64(url, callback) {
    var xhr = new XMLHttpRequest(url);
    var img64;
    xhr.open('GET', url, true); // url is the url of a PNG/JPG image.
    xhr.responseType = 'arraybuffer';
    xhr.callback = callback;
    xhr.onload = function() {
      img64 = converterEngine(this.response); // convert BLOB to base64
      this.callback(null, img64); // callback : err, data
    };

    xhr.onerror = function() {
      callback('B64 ERROR', null);
    };

    xhr.send();
  };

  function networkChart () {
    // Defaults
    var margin = {top: 0, right: 0, bottom: 0, left: 0};
    var outerWidth = 960;
    var outerHeight = 500;
    var xScale = d3.scale.linear();
    var yScale = d3.scale.linear();
    var xScaleDomain;
    var yScaleDomain;
    var edgeStatScale = function() {return '#cccccc';};

    var nodeColor = '#888888';
    var edgeWidth = 2;
    var nodeRadius = 10;
    var isFixed = true;
    var imageLink = '';

    var chartDispatcher = d3.dispatch('nodeMouseClick', 'edgeMouseClick', 'edgeMouseOver', 'edgeMouseOut');

    function chart(selection) {
      var innerWidth = outerWidth - margin.left - margin.right;
      var innerHeight = outerHeight - margin.top - margin.bottom;

      selection.each(function(data) {
        var svg = d3.select(this).selectAll('svg').data([data]);

        // isFixed ? fixNodes() : unfixNodes();

        // Initialize the chart
        var enterG = svg.enter()
          .append('svg')
            .append('g');
        enterG
          .append('g')
            .append('image')
              .attr('class', 'networkBackgroundImage')
              .attr('width', innerWidth)
              .attr('height', innerHeight);
        enterG
          .append('g')
          .attr('class', 'networkEdges');
        enterG
          .append('g')
          .attr('class', 'networkNodes');

        // Update svg size, drawing area, and scales
        svg
          .attr('width', innerWidth + margin.left + margin.right)
          .attr('height', innerHeight + margin.top + margin.bottom);
        svg.select('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        xScale
          .domain(xScaleDomain)
          .range([0, innerWidth]);
        yScale
          .domain(yScaleDomain)
          .range([innerHeight, 0]);

        // Append background image link
        insertImage(imageLink, svg.selectAll('.networkBackgroundImage'));

        // Initialize edges
        var edgeLine = svg.select('g.networkEdges').selectAll('line.edge').data(data.edges);

        edgeLine.enter()
          .append('line')
            .attr('class', 'edge')
            .style('stroke-width', edgeWidth)
            .attr('x1', function(d) {
              return xPos(d.source);
            })
            .attr('y1', function(d) {
              return yPos(d.source);
            })
            .attr('x2', function(d) {
              return xPos(d.target);
            })
            .attr('y2', function(d) {
              return yPos(d.target);
            });

        edgeLine.exit()
          .remove();
        edgeLine
          .style('stroke', function(d) {
            return edgeStatScale(d.data);
          })
          .on('mouseover', chartDispatcher.edgeMouseOver)
          .on('mouseout', chartDispatcher.edgeMouseOut)
          .on('click', chartDispatcher.edgeMouseClick);

        // Initialize nodes
        var nodeG = svg.select('g.networkNodes').selectAll('g.gnode').data(data.nodes);

        nodeG.enter()
          .append('g')
          .attr('class', 'gnode')
          .attr('transform', function(d) {
            return 'translate(' + [xPos(d), yPos(d)] + ')';
          })
          .on('click', chartDispatcher.nodeMouseClick);

        nodeG.exit().remove();

        var nodes = drawNodes();

        nodeG.call(nodes);

        var force = d3.layout.force()
            .nodes(data.nodes)
            .links(data.edges)
            .charge(-375)
            .linkDistance(innerHeight / 3)
            .size([innerWidth, innerHeight])
            .start();

        // For every iteration of force simulation 'tick'
        force.on('tick', function() {

          // Translate the groups
          nodeG.attr('transform', function(d) {
            return 'translate(' + [xPos(d), yPos(d)] + ')';
          });

          edgeLine.attr('x1', function(d) {
              return xPos(d.source);
            })
            .attr('y1', function(d) {
              return yPos(d.source);
            })
            .attr('x2', function(d) {
              return xPos(d.target);
            })
            .attr('y2', function(d) {
              return yPos(d.target);
            });
        });

        function xPos(d) {
          if (typeof d.x === 'undefined') {
            d.x = xScale(d.fixedX);
            return d.x;
          } else {
            return Math.max(nodeRadius, Math.min(innerWidth - nodeRadius, d.x));
          }

        }

        function yPos(d) {
          if (typeof d.y === 'undefined') {
            d.y = yScale(d.fixedY);
            return d.y;
          } else {
            return Math.max(nodeRadius, Math.min(innerHeight - nodeRadius, d.y));
          }

        }

        function fixNodes() {
          data.nodes.forEach(function(n) {
            n.fixed = true;
            n.x = undefined;
            n.y = undefined;
            n.px = undefined;
            n.py = undefined;
          });
        }

        function unfixNodes() {
          data.nodes.forEach(function(n) {
            n.fixed = false;
          });
        }

      });
    }

    chart.width = function(value) {
      if (!arguments.length) return outerWidth;
      outerWidth = value;
      return chart;
    };

    chart.height = function(value) {
      if (!arguments.length) return outerHeight;
      outerHeight = value;
      return chart;
    };

    chart.margin = function(value) {
      if (!arguments.length) return margin;
      margin = value;
      return chart;
    };

    chart.xScaleDomain = function(value) {
      if (!arguments.length) return xScaleDomain;
      xScaleDomain = value;
      return chart;
    };

    chart.yScaleDomain = function(value) {
      if (!arguments.length) return yScaleDomain;
      yScaleDomain = value;
      return chart;
    };

    chart.nodeRadius = function(value) {
      if (!arguments.length) return nodeRadius;
      nodeRadius = value;
      return chart;
    };

    chart.edgeWidth = function(value) {
      if (!arguments.length) return edgeWidth;
      edgeWidth = value;
      return chart;
    };

    chart.edgeStatScale = function(value) {
      if (!arguments.length) return edgeStatScale;
      edgeStatScale = value;
      return chart;
    };

    chart.isFixed = function(value) {
      if (!arguments.length) return isFixed;
      isFixed = value;
      return chart;
    };

    chart.imageLink = function(value) {
      if (!arguments.length) return imageLink;
      imageLink = value;
      return chart;
    };

    d3.rebind(chart, chartDispatcher, 'on');

    return chart;
  }

  function edgeMouseOver(e) {

    var curEdge = d3.select(this);
    var strokeStyle = curEdge.style('stroke');
    var strokeWidth = +/\d+/.exec(curEdge.style('stroke-width'));
    var strokeWidthUnits = /[a-z]+/.exec(curEdge.style('stroke-width'));
    curEdge
      .style('stroke-width', (2 * strokeWidth) + strokeWidthUnits);

    var curNodes = d3.selectAll('circle.node')
      .filter(function(n) {
        return (n.channelID === e.source.channelID) || (n.channelID === e.target.channelID);
      })
      .attr('transform', 'scale(1.2)');
  }

  function edgeMouseOut(e) {

    var curEdge = d3.select(this);
    var strokeWidth = +/\d+/.exec(curEdge.style('stroke-width'));
    var strokeWidthUnits = /[a-z]+/.exec(curEdge.style('stroke-width'));
    curEdge
      .style('stroke-width', (0.5 * strokeWidth) + strokeWidthUnits);

    var curNodes = d3.selectAll('circle.node')
      .filter(function(n) {
        return (n.channelID === e.source.channelID) || (n.channelID === e.target.channelID);
      })
      .attr('transform', 'scale(1)');
  }

  function nodeMouseClick(n) {
    var curNode = d3.select(this);
    curNode.classed('node-clicked', !curNode.classed('node-clicked'));
    d3.selectAll('.gnode').selectAll('circle').attr('transform', 'scale(1)');
    d3.selectAll('.node-clicked').selectAll('circle').attr('transform', 'scale(1.2)');

    var numClicked = d3.selectAll('.node-clicked')[0].length;
    if (numClicked >= 2) {
      var channelIDs = d3.selectAll('.node-clicked').data().map(function(d) {return d.channelID;});

      var curCh1 = channelIDs[0];
      var curCh2 = channelIDs[1];
      console.log('load spectra: Ch' + curCh1 + ', Ch' + curCh2);

      d3.selectAll('.node-clicked').classed('node-clicked', false);
      d3.selectAll('.gnode').selectAll('circle').attr('transform', 'scale(1)');
    }
  }

  function edgeMouseClick(e) {
    var re = /\d+/;
    var curCh1 = re.exec(e.source.channelID)[0];
    var curCh2 = re.exec(e.target.channelID)[0];
    console.log('load spectra: Ch' + curCh1 + ', Ch' + curCh2);

    // mouseFlag = true;
    // svgNetworkMap.select('text#HOLD').remove();
    // loadSpectra();
    edgeMouseOut.call(this, e);
  }

  var networkData = networkDataManager();
  var networkView = networkChart();

  function init(passedParams) {
    passedParams.curTime = +passedParams.curTime;
    passedParams.curFreq = +passedParams.curFreq;
    passedParams.curCh1 = passedParams.curCh1 || '';
    passedParams.curCh2 = passedParams.curCh2 || '';
    passedParams.networkView = passedParams.networkView || 'Anatomical';
    passedParams.edgeFilter = passedParams.edgeFilter || 'All';
    queue()
      .defer(d3.json, 'DATA/subjects.json')
      .defer(d3.json, 'DATA/visInfo.json')
      .defer(d3.json, 'DATA/edgeTypes.json')
      .await(function(error, subjects, visInfo, edgeTypes) {
        var curSubject = passedParams.curSubject || subjects[0].subjectID;
        var curEdgeStatID = passedParams.edgeStatID || edgeTypes[0].edgeStatID;
        var curSubjectInfo = subjects.filter(function(s) {return s.subjectID === curSubject;})[0];

        networkData
          .times(visInfo.tax)
          .frequencies(visInfo.fax)
          .networkView(passedParams.networkView)
          .edgeStatID(curEdgeStatID)
          .subjectID(curSubject)
          .curTime(passedParams.curTime)
          .curFreq(passedParams.curFreq)
          .aspectRatio(curSubjectInfo.brainXpixels / curSubjectInfo.brainYpixels)
          .brainXLim(curSubjectInfo.brainXLim)
          .brainYLim(curSubjectInfo.brainYLim)
          .edgeFilterType(passedParams.edgeFilter);

        networkData.loadNetworkData();
      });

  }

  networkView.on('edgeMouseOver', edgeMouseOver);
  networkView.on('edgeMouseOut', edgeMouseOut);
  networkView.on('nodeMouseClick', nodeMouseClick);
  networkView.on('edgeMouseClick', edgeMouseClick);

  networkData.on('dataReady', function() {
    console.log('dataReady');
  });

  networkData.on('networkChange', function() {

    var networkWidth = document.getElementById('NetworkPanel').offsetWidth;
    var networkHeight = networkWidth / networkData.aspectRatio();

    networkView
      .width(networkWidth)
      .height(networkHeight)
      .xScaleDomain(networkData.brainXLim())
      .yScaleDomain(networkData.brainYLim())
      .imageLink(networkData.imageLink());

    d3.select('#NetworkPanel').datum(networkData.networkData())
        .call(networkView);
  });

  exports.init = init;

}));