import React, { useState, useEffect } from 'react';
import { Button, Table, Input, message } from 'antd';
import axios from 'axios';

export default function MappingManagement() {
  const [linkMappings, setLinkMappings] = useState([]);
  const [imageMappings, setImageMappings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMappings();
  }, []);

  const fetchMappings = async () => {
    setIsLoading(true);
    try {
      const [linkResponse, imageResponse] = await Promise.all([
        axios.get('/api/linkMappings'),
        axios.get('/api/imageMappings')
      ]);
      setLinkMappings(linkResponse.data);
      setImageMappings(imageResponse.data);
    } catch (error) {
      message.error('Failed to fetch mappings');
    }
    setIsLoading(false);
  };

  const updateMapping = async (type, id, updatedMapping) => {
    try {
      await axios.put(`/api/${type}Mappings/${id}`, updatedMapping);
      message.success('Mapping updated successfully');
      fetchMappings();
    } catch (error) {
      message.error('Failed to update mapping');
    }
  };

  const triggerAutomation = async () => {
    setIsLoading(true);
    try {
      await axios.post('/api/triggerAutomation');
      message.success('Automation process started');
    } catch (error) {
      message.error('Failed to start automation process');
    }
    setIsLoading(false);
  };

  const linkColumns = [
    {
      title: 'English Pattern',
      dataIndex: 'englishPattern',
      key: 'englishPattern',
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateMapping('link', record.id, { ...record, englishPattern: e.target.value })}
        />
      ),
    },
    {
      title: 'Quebec French Replacement',
      dataIndex: 'quebecFrenchReplacement',
      key: 'quebecFrenchReplacement',
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateMapping('link', record.id, { ...record, quebecFrenchReplacement: e.target.value })}
        />
      ),
    },
    {
      title: 'Domain',
      dataIndex: 'domain',
      key: 'domain',
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateMapping('link', record.id, { ...record, domain: e.target.value })}
        />
      ),
    },
  ];

  const imageColumns = [
    {
      title: 'Original Pattern',
      dataIndex: 'originalPattern',
      key: 'originalPattern',
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateMapping('image', record.id, { ...record, originalPattern: e.target.value })}
        />
      ),
    },
    {
      title: 'Localized Replacement',
      dataIndex: 'localizedReplacement',
      key: 'localizedReplacement',
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateMapping('image', record.id, { ...record, localizedReplacement: e.target.value })}
        />
      ),
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Translation Automation Management</h1>
      <Button onClick={triggerAutomation} loading={isLoading} className="mb-4">
        Trigger Automation
      </Button>
      <h2 className="text-xl font-semibold mb-2">Link Mappings</h2>
      <Table dataSource={linkMappings} columns={linkColumns} rowKey="id" />
      <h2 className="text-xl font-semibold my-4">Image Mappings</h2>
      <Table dataSource={imageMappings} columns={imageColumns} rowKey="id" />
    </div>
  );
}