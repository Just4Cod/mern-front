import { Button, Form, Image, Input, message, Modal, Select, Table } from "antd";
import { ConsoleSqlOutlined, DeleteFilled, DeleteOutlined, EditFilled, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import axios from 'axios';
import useSwr, { mutate } from "swr";
axios.defaults.baseURL = 'http://localhost:8080';
const App = () => {
  const [regForm] = Form.useForm();
  const [modal, setModal] = useState(false);
  const [imgUrl, setImgUrl] = useState(null);
  const [id, setId] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const columns = [
    {
      title: 'Profile',
      dataIndex: 'profile',
      key: 'profile',
      render: (_, obj) => (
        <Image src={obj.profile} width={40} className="rounded-full" />
      )
    },
    {
      title: 'Name',
      dataIndex: 'fullname',
      key: 'fullname',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: 'mobile',
    },
    {
      title: 'DOB',
      key: 'dob',
      dataIndex: 'dob',
    },
    {
      title: 'Gender',
      key: 'gender',
      dataIndex: 'gender',
    },
    {
      title: 'Address',
      key: 'address',
      dataIndex: 'address',
    },
    {
      title: 'Action',
      key: 'action',
      dataIndex: 'action',
      render: (_, obj) => (
        <div>
          <Button
            className="text-green-500"
            icon={<EditFilled />}
            shape="circle"
            type="text"
            onClick={() => onEdit(obj)}
          />
          <Button
            className="text-rose-500"
            icon={<DeleteFilled />}
            shape="circle"
            type="text"
            onClick={() => onDelete(obj._id)}
          />
        </div>
      )
    },
  ]

  const fetcher = async (url) => {
    try {
      const { data } = await axios.get(url);
      return data;
    } catch (err) {
      return null;
    }
  }

  const { data, error } = useSwr(
    '/register',
    fetcher
  )

  const dataSource = data && data.map(item=>({
    ...item,
    key : item._id
  }))

  // handle images 
  const handleImage = (e) => {
    const file = e.target.files[0];
    const fReader = new FileReader();
    if (file.size <= 60000) {
      setDisabled(false);
      regForm.setFields([{ name: 'profile', errors: [] }]);
      fReader.readAsDataURL(file);
      fReader.onload = (ev) => {
        const url = ev.target.result;
        setImgUrl(url);
      }
    }
    else {
      setDisabled(true);
      regForm.setFields([{ name: 'profile', errors: ['Max 60KB Image Size !'] }])
    }
  }

  // handle delete
  const onDelete = async (id) => {
    try {
      await axios.delete(`/register/${id}`);
      message.success("Data deleted successfully !");
      mutate('/register');
    } catch (err) {
      message.error("Unable to delete data !");
    }
  }

  // handle edit
  const onEdit = (obj) => {
    delete obj.profile;
    setModal(true);
    regForm.setFieldsValue(obj);
    setId(obj._id);
  }

  // create new record in database
  const onFinish = async (values) => {
    imgUrl ? values.profile = imgUrl : values.profile = 'https://cdn.pixabay.com/photo/2015/03/04/22/35/head-659652_1280.png'
    try {
      await axios.post('/register', values);
      setModal(false);
      regForm.resetFields();
      setImgUrl(null);
      mutate('/register');
      message.success("Registration success !");
    }
    catch (err) {
      if (err.response.data.error.code === 11000)
        return regForm.setFields([{ name: 'email', errors: ['Already exist !'] }])
      message.error("Unable to insert data !");
    }
  }

  // update record from database
  const onUpdate = async (values) => {
    imgUrl ? values.profile = imgUrl : delete values.profile;
    try {
      await axios.put(`/register/${id}`,values);
      setModal(false);
      regForm.resetFields();
      setImgUrl(null);
      setId(null);
      mutate('/register');
      message.success("Update success !");
    }
    catch (err) {
      message.error("Unable to update data !");
    }
  }

  // close modal and reset form at onclose
  const onClose = () =>{
    setModal(false);
    setId(null);
    regForm.resetFields();
  }

  return (
    <div className="min-h-screen bg-rose-100 flex 
    flex-col items-center md:p-4">
      <div className="flex rounded justify-between items-center bg-blue-600 
      w-10/12 my-5 p-4
      ">
        <h1 className="cpitalize font-bold  text-white text-2xl md:text-5xl">
          Mern Crud Operation
        </h1>
        <Button
          shape="circle"
          size="large"
          className="bg-green-400 text-white"
          type="text"
          icon={<PlusOutlined />}
          onClick={() => setModal(true)}
        />
      </div>
      <Table
        className="w-10/12"
        columns={columns}
        dataSource={dataSource}
        pagination={{ pageSize: 5, position: ['bottomCenter'] }}
        scroll={{ x: 'max-content' }}
      />
      <Modal
        open={modal}
        onCancel={onClose}
        footer={null}
        title={
          <h1 className="text-xl font-semibold">
            Regsitraion Form
          </h1>
        }
        width={720}
      >
        <Form layout="vertical"
          onFinish={id ? onUpdate : onFinish}
          form={regForm}
          className="font-semibold"
        >
          <div className="mt-5 grid md:grid-cols-2 gap-x-2">
            <Form.Item
              label="Profile"
              name="profile"
            >
              <Input
                onChange={(e) => handleImage(e)}
                type="file"
                style={{ borderRadius: 0 }} />
            </Form.Item>
            <Form.Item
              label="Fullname"
              name="fullname"
              rules={[{ required: true }]}
            >
              <Input size="large" style={{ borderRadius: 0 }} />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true }]}
            >
              <Input size="large" style={{ borderRadius: 0 }} />
            </Form.Item>
            <Form.Item
              label="Mobile"
              name="mobile"
              rules={[{ required: true }]}
            >
              <Input size="large" style={{ borderRadius: 0 }} />
            </Form.Item>
            <Form.Item
              label="DOB"
              name="dob"
              rules={[{ required: true }]}
            >
              <Input type="date" size="large" style={{ borderRadius: 0 }} />
            </Form.Item>
            <Form.Item
              label="Gender"
              name="gender"
              rules={[{ required: true }]}
            >
              <Select className="custom-select" size="large" placeholder="Select Gender">
                <Select.Option value="male">Male</Select.Option>
                <Select.Option value="female">Female</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true }]}
          >
            <Input.TextArea style={{ borderRadius: 0 }}></Input.TextArea>
          </Form.Item>
          <Form.Item >
            {
              id ?
                <Button
                  disabled={disabled}
                  htmlType="submit"
                  className="w-full font-semibold text-white bg-rose-600"
                  size="large"
                  style={{ borderRadius: 0 }}
                  icon={<PlusOutlined />}
                >
                  Update Now
                </Button>
                :
                <Button
                  disabled={disabled}
                  htmlType="submit"
                  className="w-full font-semibold text-white bg-blue-600"
                  size="large"
                  style={{ borderRadius: 0 }}
                  icon={<PlusOutlined />}
                >
                  Register Now
                </Button>
            }
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
export default App;