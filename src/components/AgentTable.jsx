import { Table, Button, Modal, Input, message, Popconfirm, Space } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";

const AgentTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agentTitle, setAgentTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  const fetchAgents = async () => {
    try {
      setTableLoading(true);
      const res = await axios.get("http://127.0.0.1:8000/api/agents");
      if (res.data.success) {
        setAgents(res.data.data);
      } else {
        message.error("Failed to fetch agents");
      }
    } catch (err) {
      message.error("Error fetching agents");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCreateAgent = async () => {
    if (!agentTitle.trim()) {
      message.error("Please enter an agent title");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/agents", {
        title: agentTitle,
      });

      if (res.data.success) {
        message.success(`Agent "${agentTitle}" created successfully`);
        setIsModalOpen(false);
        setAgentTitle("");
        fetchAgents();
      } else {
        message.error("Failed to create agent");
      }
    } catch (err) {
      message.error("Error creating agent");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgent = async (agentId) => {
    try {
      const res = await axios.delete(
        `http://127.0.0.1:8000/api/agents/${agentId}`
      );
      if (res.data.success) {
        message.success("Agent deleted successfully");
        fetchAgents();
      } else {
        message.error("Failed to delete agent");
      }
    } catch (err) {
      message.error("Error deleting agent");
    }
  };

  const columns = [
    {
      title: "#",
      key: "index",
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Agent Title",
      dataIndex: "title",
      key: "title",
      align: "center",
    },
    {
      title: "Information Sources",
      dataIndex: "id",
      key: "id",
      align: "center",
      render: (id) => <a href={`/information-sources?agentId=${id}`}>{id}</a>,
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="Are you sure you want to delete this agent?"
          onConfirm={() => handleDeleteAgent(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button danger type="primary">
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: "2rem" }}>
      <Table
        dataSource={agents}
        columns={columns}
        rowKey="id"
        pagination={false}
        loading={tableLoading}
      />

      <div
        style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}
      >
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          Create Agent
        </Button>
      </div>

      <Modal
        title="Create New Agent"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleCreateAgent}
        confirmLoading={loading}
        okText="Submit"
      >
        <Input
          placeholder="Enter agent title"
          value={agentTitle}
          onChange={(e) => setAgentTitle(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default AgentTable;
