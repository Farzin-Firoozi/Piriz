import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Switch, Row, Typography, Col } from "antd";

import React, { useState } from "react";
import { sendInfo } from "../api";

const ModeSelector = ({}) => {
  const [isManual, setIsManual] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateMode = (isActive) => {
    setIsLoading(true);
    sendInfo({
      is_manual: isActive ? 1 : 0,
    })
      .then((res) => {
        setIsManual(!!res.data?.is_manual);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <div>
        <Typography.Text>Manual Mode</Typography.Text>
      </div>
      <Switch
        loading={isLoading}
        onChange={updateMode}
        checkedChildren={<CheckOutlined />}
        unCheckedChildren={<CloseOutlined />}
        checked={isManual}
      />
    </>
  );
};

export default ModeSelector;
