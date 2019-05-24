import React, {Component} from 'react';
import {Button, Table, Row, Col, Upload, Icon, message} from 'antd';
import XLSX from 'xlsx';
import {exportExcel} from './simpleXlsx';

const Dragger = Upload.Dragger;

const allColumns = [
    {
        title: '全部号码',
        dataIndex: 'phone',
    },
];

const cmccColumns = [
    {
        title: '移动号码',
        dataIndex: 'phone',
    },
];

const cuccColumns = [
    {
        title: '联通号码',
        dataIndex: 'phone',
    },
];

const ctccColumns = [
    {
        title: '电信号码',
        dataIndex: 'phone',
    },
];

function isCMCC(phone) {
    let regex = /^((13[4-9])|(147)|(15([0-2]|[7-9]))|(17[2|8])|(18[2|3|4|7|8])|(198))[\d]{8}$/;
    return regex.test(phone);
}

function isCUCC(phone) {
    let regex = /^((13[0-2])|(145)|(15[5-6])|(166)|(17[1|5|6])|(18[5-6]))[\d]{8}$/;
    return regex.test(phone);
}

function isCTCC(phone) {
    let regex = /^((133)|(149)|(153)|(17[3|7])|(18[0|1|9])|(199))[\d]{8}$/;
    return regex.test(phone);
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showUploadList: false,
            allData: [],
            cmccData: [],
            cuccData: [],
            ctccData: [],
            filename: '',
            disabled: true
        };
    }

    handleChange = info => {
        let fileReader = new FileReader();
        fileReader.onload = event => {
            let allData = [];
            let cmccData = [];
            let cuccData = [];
            let ctccData = [];
            try {
                const {result} = event.target;
                // 以二进制流方式读取得到整份excel表格对象
                const workbook = XLSX.read(result, {type: 'binary'});
                // 存储获取到的数据
                let data = [];
                // 读取第一个sheet的第一列的数据
                const first_sheet_name = workbook.SheetNames[0]; // 获取工作簿中的工作表名字
                const first_sheet = workbook.Sheets[first_sheet_name]; // 获取对应的工作表对象

                for (let rowId in first_sheet) {
                    const row = first_sheet[rowId];
                    if (row['v']) {
                        data.push(row['v']);
                    }
                }

                data.forEach((item, index) => {
                    let temp = {
                        phone: item,
                        key: index
                    };
                    allData.push(temp);
                    if (isCMCC(item)) {
                        cmccData.push(temp);
                    } else if (isCUCC(item)) {
                        cuccData.push(temp);
                    } else if (isCTCC(item)) {
                        ctccData.push(item);
                    }
                });
                this.setState({
                    allData,
                    cmccData,
                    cuccData,
                    ctccData,
                    disabled: false,
                    filename: info.file.name,
                });
                message.success('解析完成，请点击下载');
            } catch (e) {
                // 这里可以抛出文件类型错误不正确的相关提示
                message.error('文件类型不正确或处理出错');
            }
        };
        // 以二进制方式打开文件
        fileReader.readAsBinaryString(info.file);
    };

    handleBefore = () => {
        return false;
    };

    downloadData(type) {
        let data = [];
        if (type === 'cmcc') {
            data = this.state.cmccData.map(obj => [obj.phone]);
        } else if (type === 'cucc') {
            data = this.state.cuccData.map(obj => [obj.phone]);
        } else if (type === 'ctcc') {
            data = this.state.ctccData.map(obj => [obj.phone]);
        }
        exportExcel(data, type + '-' + this.state.filename.substring(0, this.state.filename.indexOf(".")));
    }

    render() {
        return (
            <div className="App">
                <Row>
                    <Col span={24}>
                        <Dragger
                            accept='.xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                            name='file'
                            showUploadList={this.state.showUploadList}
                            beforeUpload={this.handleBefore}
                            onChange={this.handleChange}>
                            <p className="ant-upload-drag-icon">
                                <Icon type="inbox"/>
                            </p>
                            <p className="ant-upload-text">拖拽文件或点击选择文件</p>
                            <p className="ant-upload-hint">
                                只支持 .xls 和 .xlsx 等 Excel 格式的文件
                            </p>
                        </Dragger>
                    </Col>
                </Row>
                <Row>
                    <Col span={6}>
                        <Table columns={allColumns} dataSource={this.state.allData} pagination={false}
                               scroll={{y: 260}}/>
                    </Col>
                    <Col span={6}>
                        <Table columns={cmccColumns} dataSource={this.state.cmccData} pagination={false}
                               scroll={{y: 290}}/>
                    </Col>
                    <Col span={6}>
                        <Table columns={cuccColumns} dataSource={this.state.cuccData} pagination={false}
                               scroll={{y: 290}}/>
                    </Col>
                    <Col span={6}>
                        <Table columns={ctccColumns} dataSource={this.state.ctccData} pagination={false}
                               scroll={{y: 290}}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={6}></Col>
                    <Col span={6}>
                        <Button type="primary" shape="round" icon="download" size="large"
                                disabled={this.state.disabled} onClick={this.downloadData.bind(this, 'cmcc')}>
                            Download
                        </Button>
                    </Col>
                    <Col span={6}>
                        <Button type="primary" shape="round" icon="download" size="large"
                                disabled={this.state.disabled} onClick={this.downloadData.bind(this, 'cucc')}>
                            Download
                        </Button>
                    </Col>
                    <Col span={6}>
                        <Button type="primary" shape="round" icon="download" size="large"
                                disabled={this.state.disabled} onClick={this.downloadData.bind(this, 'ctcc')}>
                            Download
                        </Button>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default App;