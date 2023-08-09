import { useEffect, useRef, useState } from "react";
import { ECharts } from "echarts";
// import * as echarts from "echarts/core";
import * as echarts from "echarts";
import chinaMap from "./map/json/china.json";
import worldMap from "./map/json/world.json";
import worldChinaMap from "./map/json/world-china.json";
import worldMap2 from "./map/json/world2.json";
import worldMap3 from "./map/json/world3.json";

function getRandomProbs(pron: string) {
  const num = Math.floor(Math.random() * 10);
  if (num === 0) return { name: pron, value: -1 };
  // fake probs
  const randomProbes = new Array(num)
    .fill(0)
    .map((_, idx) => ({ name: `探针${idx}`, value: Math.random() * 250 }));
  return {
    name: pron,
    value: randomProbes.reduce((prev, old) => (prev += old.value), 0) / num,
    probes: randomProbes,
  };
}

const locationGeoMap: Map<string, any[]> = new Map();

function fakeRegionProbs() {
  // const features = chinaMap["features"];
  const features = worldMap3["features"];
  // console.log(worldMap3["features"]);
  // 中国所有的省份
  const allProns = features.map((feature) => {
    // 地名
    const loc = feature.properties.name;
    const geometry = feature.geometry.coordinates;
    locationGeoMap.set(loc, geometry);
    return loc;
  });
  return allProns.map((pron) => getRandomProbs(pron));
}

function App() {
  const echartsDomRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ECharts>();
  const fakeChinaData = fakeRegionProbs();
  const [options, setOptions] = useState({
    title: {
      text: "世界地图与中国各省探针信息",
      subtext: "示例",
      x: "center",
    },
    toolbox: {
      show: true,
      feature: {
        restore: { title: "还原" },
        saveAsImage: { title: "保存为图片" }, // 顺便添加一个保存为图片的工具
      },
    },
    tooltip: {
      trigger: "item",
      formatter: function (params) {
        let info = `${params.name}: ${params.value}`;

        // 如果数据项有probes属性，则展示它们
        if (params.data && params.data.probes) {
          info +=
            "<br/>" +
            params.data.probes
              .map((probe) => `${probe.name}: ${probe.value}`)
              .join("<br/>");
        }

        return info;
      },
    },
    // 热力图
    visualMap: {
      pieces: [
        { min: 200, color: "#d94e5d", label: "≥ 200" },
        { min: 100, max: 200, color: "#eac736", label: "100 - 200" },
        { min: 50, max: 100, color: "#50a3ba", label: "50 - 100" },
        { max: 50, min: 0, color: "#009688", label: "≤ 50" },
        { min: -1, max: -1, color: "white", label: "没有数据" },
        // { value: -1 }  没有数据的区域
      ],
      type: "piecewise", // 指定 visualMap 为分段型
      orient: "vertical", // 热力图的方向为垂直方向，也可以选择水平方向
      left: "left", // 热力图的位置
      top: "bottom",
      textStyle: {
        color: "#000", // 文字的颜色
      },
    },
    series: [
      {
        name: "世界",
        type: "map",
        mapType: "world",
        // 鼠标滚轮缩放
        // roam: "scale",
        roam: true,
        data: [...fakeChinaData],
        zlevel: 1,
        itemStyle: {
          normal: {
            // areaColor: "rgba(2,68,158, .5)", //地图颜色rgba
            areaColor: "rgba(0, 0, 0, 0.5)",
            borderWidth: 1, //设置外层边框
            borderColor: "rgba(65,154,225, 1)", //地图外边框颜色rgba(43, 196, 243, 1)
            label: {
              show: true, //是否显示标签
              textStyle: {
                // color: "rgba(255,255,255,.5)", //地图文字的颜色
                color: "rgba(255, 255, 255, 0.5)",
              },
              formatter: function (params) {
                return `${params.data.name}: ${
                  params.data.value === -1
                    ? "没有数据"
                    : "平均" + params.data.value.toFixed(2)
                }`;
              },
            },
          },
          emphasis: {
            areaColor: "#01215c",
          },
        },
      },
    ],
  });

  useEffect(() => {
    chartInstance.current = echarts.init(echartsDomRef.current);
    echarts.registerMap("china", chinaMap);
    echarts.registerMap("world", worldMap3);
    chartInstance.current.setOption(options);

    chartInstance.current.on("click", (params) => {
      // 在这里使用 dispatchAction
      // handleCountryOrProvinceClick(params);
      console.log("params ", params);
    });
  }, []);

  return (
    <>
      <div>echarts test</div>
      <div ref={echartsDomRef} style={{ width: "800px", height: "600px" }} />
    </>
  );
}

export default App;
