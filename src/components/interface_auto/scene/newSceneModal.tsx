import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, List, Checkbox, Pagination, Input, message, Form } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import axios from 'axios';


let  Search = Input.Search

const searchApi = async (url: string): Promise<any> => {
  try {
    const response = await axios.get(url);
    return response.data; // 成功时返回数据
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message; // 如果是 Axios 错误，抛出错误信息或响应数据
    } else {
      throw new Error(`Unknown error occurred: ${error}`); // 对于非 Axios 错误，抛出未知错误
    }
  }
};

interface NewSceneModalProps {
  title: string;
  visible: boolean;
  fetchData: (page?: number, pageSize?: number) => Promise<void>;
  closeModel: () =>(void);
}

const NewSceneModal: React.FC<NewSceneModalProps> = ({
  visible,
  fetchData,
  closeModel
}) => {

  // state: 创建场景 Modal 的数据列表
  const [listData, setListData] = useState<{id:number, text: string }[]>([]);

  // state: 创建场景 Modal 的搜索框
  const [searchValue, setSearchValue] = useState('');

  // state: 搜索 Api Modal 的开关
  const [searchResultsVisible, setSearchResultsVisible] = useState(false);

  // state: 搜索 Api Modal 的搜索结果列表
  const [searchResults, setSearchResults] = useState<{id: number, text: string; }[]>([]);

  // state: 搜索 Api Modal 的选中数据
  const [selectedItems, setSelectedItems] = useState<{id: number, text: string}[]>([]);

  // state: 搜索 Api Modal 的全选,控制是否数据全选
  const [selectAll, setSelectAll] = useState(false);

  const initPage = {page:1,pageSize: 10}

  // state: 搜索 Api Modal 的页码
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // state: 创建场景的数据列表页码
  const [sceneCurrentPage, setSceneCurrentPage] = useState(1)
  const [scenePageSize, setScenePageSize] = useState(5)
  const [form] = Form.useForm(); // 创建表单实例


  // 计算搜索 ApiModal 的分页数据
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = searchResults.slice(startIndex, endIndex);

  // 计算创建场景 Modal 的分页数据
  const sceneStartIndex = (sceneCurrentPage - 1) * scenePageSize;
  const sceneEndIndex = sceneStartIndex + scenePageSize;
  const scenePaginatedData = listData.slice(sceneStartIndex, sceneEndIndex);


  const onFinish = async () => {
    try {
        // 触发表单验证
        await form.validateFields();

        // 收集表单数据
        const values = form.getFieldsValue();
        if (listData.length == 0) {
            message.error("请先添加接口")
            return
        }

        let data = {
            scname: values.scenename,
            author: values.author,
            description: values.description,
            actions: listData.map(item => item.id.toString()),
            key: "",
            env: "test"
        }
        let url = 'http://localhost:8000/scene/new'
        const response = await axios.post(url,data)
        if (response.status == 200) {
            message.success("创建场景成功")
            fetchData(initPage.page,initPage.pageSize)
        } else {
            message.error("创建场景失败")
        }
        form.resetFields()
        closeModel()
    } catch (errorInfo) {
        message.error("请求发送失败")
        // setIsModalVisible(false)
        form.resetFields()
        closeModel()
        return
    }
  };

  const handleCancel = () => {
    closeModel()
    form.resetFields()
  };

  const showSearchModal = () => {
    setSearchResultsVisible(true)
  }


  const renderListItem = (item: { id: number; text: string; }) => (
    <List.Item key={item.id}>
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#FDEDEC',
                borderRadius: '8px',
                padding: '4px 8px',
                gap: '8px',
            }}
        >
            <span>{item.text}</span>
            <Button
                type="link"
                size="small"
                style={{
                    color: '#FF7F50',
                    fontSize: 5
                }}
                icon={<CloseOutlined />}
                onClick={() => onDelete(item.id)}
            />
        </div>
    </List.Item>
  );


  const onSearch = (value: string) => {
    if (value === '') {
        message.error('请输入关键词');
        return
    }
    var reqUrl = `http://localhost:8000/api/searchApi?keyword=${value}`
    searchApi(reqUrl).then(data => {
        if (data.data.length === 0) {
            message.info('无搜索结果');
            return
        } else {
            const formattedData = data.data.map((item: any, index: number) => ({
                id: item.id,
                text: `${item.fullName} / ${item.name}`, // 替换为实际的字段名
              }));
            setSearchResults(formattedData);
            setSearchResultsVisible(true);
        }
    }).catch(err=>{
        console.error('Error occurred:', err);
        message.error('搜索失败');
        return
    })
  };


  const checkAndAddSelectedItems = () => {
    const newItems = selectedItems.filter(item => !listData.some(listItem => listItem.id === item.id));
  
    if (newItems.length < selectedItems.length) {
      message.warning('当前已存在记录');
    }
  
    if (newItems.length > 0) {
      setListData(prevListData => [...prevListData, ...newItems]);
    }
  
    setSearchResultsVisible(false);
    setSelectedItems([]);
    setSearchValue('')
    setSearchResults([])
    setSelectAll(false)
  };

  const onDelete = (id: number) => {
    setListData(prevData => prevData.filter(item => item.id !== id));
  };


  return (
      <>
      <Modal
      title="新增测试场景"
      open={visible}
      onCancel={handleCancel}
      onOk={onFinish}
      okText="提交"
      cancelText="取消"
    >
      <Form
        form={form}
        name="basic"
        initialValues={{ remember: true }}
        autoComplete="off"
        layout='inline'
      >
        <Form.Item
          label="场景名称"
          name="scenename"
          rules={[{ required: true, message: '请输入场景名称!' }]}
          style={{ width: '450px', marginBottom: '16px' }}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="场景描述"
          name="description"
          rules={[{ required: true, message: '请输入场景描述!' }]}
          style={{ width: '450px', marginBottom: '16px' }}
        >
          <Input.TextArea />
        </Form.Item>

        <Form.Item
          label="创建人"
          name="author"
          rules={[{ required: true, message: '请输入创建人!' }]}
          style={{ width: '440px', marginBottom: '16px', marginLeft: '16px' }}
        >
          <Input />
        </Form.Item>
      </Form>
      <Button type="primary" onClick={showSearchModal}>添加</Button>
      <List
        itemLayout="horizontal"
        dataSource={scenePaginatedData}
        renderItem={(item: { id: number; text: string; }, index: number) => renderListItem(item)} />
      {listData.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <Pagination
            current={sceneCurrentPage}
            pageSize={scenePageSize}
            total={listData.length}
            onChange={(page, pageSize) => {
              setSceneCurrentPage(page);
              setScenePageSize(pageSize);
            } } />
        </div>
      )}
    </Modal>
    <Modal
      title="添加接口"
      open={searchResultsVisible}
      onOk={checkAndAddSelectedItems}
      onCancel={() => {
        setSearchResultsVisible(false);
        setSearchValue('');
        setSearchResults([]);
        setSelectedItems([]);
        setSelectAll(false);
      } }
      okText="加载到列表"
      cancelText="取消"
      okButtonProps={{ disabled: selectedItems.length === 0 }}
    >
        <Search placeholder="搜索api接口"
          onSearch={onSearch}
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          style={{ marginBottom: 16 }} />
        {searchResults.length > 0 &&
          <div>
            <Button
              type="primary"
              onClick={() => {
                if (selectAll) {
                  setSelectedItems([]);
                  setSelectAll(false);
                } else {
                  setSelectedItems(searchResults);
                  setSelectAll(true);
                }
              } }
            >
              {selectAll ? '取消全选' : '全选'}
            </Button>
          </div>}
        <List
          style={{ marginTop: 20 }}
          itemLayout="horizontal"
          dataSource={paginatedData}
          renderItem={(item: { id: number; text: string; }, index: number) => (
            <Checkbox
              key={item.id}
              checked={selectedItems.some(selectedItem => selectedItem.id === item.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedItems([...selectedItems, item]);
                } else {
                  setSelectedItems(selectedItems.filter(selectedItem => selectedItem.id !== item.id));
                }
              } }
            >
              {item.text}
            </Checkbox>
          )} />
        {searchResults.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={searchResults.length}
              onChange={(page, pageSize) => {
                setCurrentPage(page);
                setPageSize(pageSize);
              } } />
          </div>
        )}
      </Modal></>
  );
};

export default NewSceneModal;