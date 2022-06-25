import React, { useEffect, useState } from "react";
import { getTemperatures } from "../api";

import { Line } from "@ant-design/plots";

import { LoadingOutlined } from "@ant-design/icons";
import { Card, Spin } from "antd";

const Chart = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);

  const fetchData = () => {
    setIsLoading(true);
    getTemperatures()
      .then((res) => {
        setData(res.data);
      })
      .finally(() => {
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 3000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Card style={{ position: "relative" }}>
      {isLoading && (
        <Spin
          style={{ position: "absolute", right: 12, top: 12 }}
          indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
        />
      )}
      <Line
        {...{
          data,
          smooth: true,
          padding: "auto",
          xField: "date_added",
          yField: "value",
          color: "#1890FF",
          tooltip: {
            showTitle: true,
            title: "Temp in C°",
          },
          xAxis: {
            tickCount: 30,
            title: {
              text: "Time",
              style: {
                fontSize: 24,
              },
            },
          },
          yAxis: {
            min: Math.min(...data.map((item) => item.value - 1)),
            max: Math.max(...data.map((item) => item.value + 1)),
            title: {
              text: "Temperature",
              style: {
                fontSize: 24,
              },
            },
          },
        }}
      />
    </Card>
  );
};

export default Chart;
