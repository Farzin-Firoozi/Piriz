import React, { useEffect, useState } from "react";
import { getInfo } from "../api";
import ModeSelector from "./mode";

const InfoController = () => {
  const [info, setInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = () => {
    setIsLoading(true);
    getInfo()
      .then((res) => {
        setInfo(res.data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <ModeSelector />
    </>
  );
};

export default InfoController;
