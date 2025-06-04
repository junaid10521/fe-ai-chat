import {
  Table,
  message,
  Button,
  Modal,
  Input,
  Form,
  Progress,
  notification,
} from "antd";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const InformationSources = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const intervalRef = useRef(null);
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const agentId = queryParams.get("agentId");

  const openNotification = () => {
    notification.success({
      message: "Scraping Completed",
      description: "Website scraping for the agent has finished.",
      duration: 5,
    });
  };

  const clearScrapingInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const fetchWebpages = async () => {
    if (!agentId) {
      message.error("No agent ID provided in URL.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `http://127.0.0.1:8000/api/scraper/websites/${agentId}/`
      );

      if (res.data.success) {
        const data = res.data.data;
        setRecords(data);

        if (data.length > 0) {
          const completedCount = data.filter((r) => r.status === "done").length;
          const currentProgress = Math.round(
            (completedCount / data.length) * 100
          );
          setProgress(currentProgress);

          if (currentProgress === 100 && scraping) {
            setScraping(false);
            clearScrapingInterval();
            openNotification();
          }
        } else {
          setProgress(0);
        }
      } else {
        message.error("Failed to fetch records.");
      }
    } catch (error) {
      message.error("Error fetching records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebpages();
  }, [agentId]);

  useEffect(() => {
    if (scraping && !intervalRef.current) {
      intervalRef.current = setInterval(fetchWebpages, 3000);
    }

    if (!scraping) {
      clearScrapingInterval();
    }

    return () => {
      clearScrapingInterval();
    };
  }, [scraping]);

  const handleScrapeWebsite = async () => {
    try {
      const values = await form.validateFields();

      // Always send an array with one full URL (as entered)
      const websitesList = [values.websites.trim()];

      await axios.post(
        `http://127.0.0.1:8000/api/scraper/websites/${agentId}/`,
        {
          websites: websitesList,
          has_specific_urls: true,
          level: 1,
        }
      );

      message.success("Scraping started.");
      setScraping(true);
      setProgress(0);
      fetchWebpages();
      setIsModalVisible(false);
      form.resetFields();
    } catch (err) {
      message.error("Failed to start scraping.");
    }
  };

  const columns = [
    {
      title: "#",
      key: "index",
      render: (_, __, index) => index + 1,
    },
    {
      title: "URL",
      dataIndex: "url",
      key: "url",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
    },
  ];

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Webpages for Agent: {agentId}</h2>

      {scraping && (
        <Progress
          percent={progress}
          status={progress < 100 ? "active" : "success"}
          style={{ marginBottom: 16 }}
        />
      )}

      <Table
        dataSource={records}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={false}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "right",
        }}
      >
        <Button
          type="primary"
          onClick={() => setIsModalVisible(true)}
          disabled={scraping}
          style={{ marginTop: 20 }}
        >
          Scrape Website
        </Button>
      </div>

      <Modal
        title="Scrape Website"
        open={isModalVisible}
        onOk={handleScrapeWebsite}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Websites"
            name="websites"
            rules={[
              {
                required: true,
                message: "Please enter at least one website URL",
              },
            ]}
          >
            <Input.TextArea placeholder="Enter one or more URLs separated by commas" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InformationSources;
