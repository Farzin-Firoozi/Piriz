import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Switch, Row, Typography, Card, Col, Button } from "antd";
import WindIcon from "../images/wind.svg";

import React, { useState } from "react";
import { sendInfo } from "../api";

const ModeSelector = ({}) => {
  const [isDeviceActive, setIsDeviceActive] = useState(true);
  const [info, setInfo] = useState({});
  const [isManual, setIsManual] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateInfo = (data) => {
    setIsLoading(true);
    sendInfo(data)
      .then((res) => {
        setInfo(res.data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

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

  const onDeviceStateChange = () => {
    if (
      window.confirm(`Device is going to turn ${info.is_active ? "off" : "on"}`)
    ) {
      updateInfo({ is_active: info.is_active ? 0 : 1 });
    }
  };

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <Col>
          <div onClick={onDeviceStateChange} style={{ color: "red" }}>
            <PowerIcon />
          </div>
          <Typography.Text>
            Device is {info.is_active ? " on" : " off"}
          </Typography.Text>
        </Col>
      </Card>
      <Card>
        <Row justify="space-between">
          <Typography.Text>Manual Mode</Typography.Text>
          <Switch
            loading={isLoading}
            onChange={updateMode}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            checked={isManual}
          />
        </Row>
        <Row justify="space-between" style={{ marginTop: 16 }}>
          <Row>
            <Typography.Text>Fan</Typography.Text>
            <img
              alt="Fan"
              src={WindIcon}
              style={{
                width: 24,
                marginLeft: 8,
              }}
            />
          </Row>
          <Switch
            loading={isLoading}
            onChange={updateMode}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            checked={isManual}
          />
        </Row>
      </Card>
    </>
  );
};

export default ModeSelector;

const PowerIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="56"
      height="56"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="feather feather-power"
    >
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
      <line x1="12" y1="2" x2="12" y2="12"></line>
    </svg>
  );
};
