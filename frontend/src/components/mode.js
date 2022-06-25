import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import {
  Switch,
  Row,
  Typography,
  Card,
  Button,
  Select,
  Form,
  InputNumber,
} from "antd";
import WindIcon from "../images/wind.svg";

import React, { useEffect, useState } from "react";
import { sendInfo } from "../api";

const ModeSelector = () => {
  const [info, setInfo] = useState({});

  const [isInfoLoading, setIsInfoLoading] = useState(false);

  const [isPowerLoading, setIsPowerLoading] = useState(false);
  const [timerUnit, setTimerUnit] = useState(1);

  const updateInfo = (data) => {
    return sendInfo(data).then((res) => {
      setInfo(res.data);
    });
  };

  useEffect(() => {
    updateInfo({});
  }, []);

  const onDeviceStateChange = () => {
    if (
      window.confirm(`Device is going to turn ${info.is_active ? "off" : "on"}`)
    ) {
      updateInfo({ is_active: info?.is_active ? 0 : 1 });
    }
  };

  const toggleManualMode = () => {
    updateInfo({ is_manual: info?.is_manual ? 0 : 1 });
  };

  const toggleFan = () => {
    updateInfo({ is_fan_active: info?.is_fan_active ? 0 : 1 });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  const onSubmitTimerUpdate = ({ duration }) => {
    updateInfo({ timer_length: duration * timerUnit });
  };

  const onStopTimer = () => {
    updateInfo({ timer_length: -1 });
  };

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            onClick={onDeviceStateChange}
            style={{
              color: info?.is_active ? "green" : "gray",
              cursor: "pointer",
            }}
          >
            <PowerIcon />
          </div>
          <Typography.Text>
            Device is {info?.is_active ? " on" : " off"}
          </Typography.Text>
        </div>
      </Card>
      {!!info.is_active && (
        <>
          <Card style={{ marginBottom: 16 }}>
            <Typography.Title level={3}>Controls</Typography.Title>

            <Row justify="space-between">
              <Typography.Text>Manual Mode</Typography.Text>
              <Switch
                onChange={toggleManualMode}
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                checked={info?.is_manual}
              />
            </Row>
            {!!info?.is_manual && (
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
                  onChange={toggleFan}
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  checked={info?.is_fan_active}
                />
              </Row>
            )}
          </Card>

          <Card style={{ marginBottom: 32 }}>
            <Typography.Title level={3}>Timer</Typography.Title>

            <Form
              name="basic"
              initialValues={{ remember: true }}
              onFinish={onSubmitTimerUpdate}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
              layout="vertical"
              style={{ width: "100%" }}
            >
              <Form.Item
                style={{ width: "100%" }}
                name="duration"
                placeholder="Enter the duration"
                rules={[{ required: true, message: "Please enter duration." }]}
              >
                <InputNumber
                  addonAfter={
                    <Select
                      defaultValue="1"
                      className="select-after"
                      onChange={(e) => setTimerUnit(e)}
                    >
                      <Select.Option value="1">Seconds</Select.Option>
                      <Select.Option value="60">Minutes</Select.Option>
                      <Select.Option value="3600">Hours</Select.Option>
                    </Select>
                  }
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Update timer
                </Button>
                <Button
                  type="text"
                  style={{ color: "red" }}
                  onClick={onStopTimer}
                >
                  Stop timer
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </>
      )}
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
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
      <line x1="12" y1="2" x2="12" y2="12"></line>
    </svg>
  );
};
