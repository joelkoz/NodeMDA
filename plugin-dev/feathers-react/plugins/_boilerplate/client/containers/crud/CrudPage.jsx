
import React from 'react';
import FeathersComponent from '../FeathersComponent';
import Dimensions from 'react-dimensions';
import CrudList from './CrudList';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

const UNKNOWN_ROW_COUNT = 99999;

class CrudPage extends FeathersComponent {

  constructor() {
    super();

    this.state = {
      list: [],
      dataIsLoading: false,
      remoteRowCount: UNKNOWN_ROW_COUNT,
      editIndex: -2
    }

    this.lastScrollTop = 0;

    this.onRecordCreated = this.onRecordCreated.bind(this);
    this.onRecordUpdated = this.onRecordUpdated.bind(this);
    this.onRecordRemoved = this.onRecordRemoved.bind(this);
  }


  componentWillMount() {
    this.appComponent.pushAppBarInfo(this.props.pageTitle);
    this.RecordEditor = this.props.dao.schema.getReactMUIFormComponent();

//    this.props.dao.on('created', this.onRecordCreated);
//    this.props.dao.on('patched', this.onRecordUpdated);
//    this.props.dao.on('removed', this.onRecordRemoved);
  }



  componentWillUnmount() {
//    this.props.dao.off('created', this.onRecordCreated);
//    this.props.dao.off('patched', this.onRecordUpdated);
//    this.props.dao.off('removed', this.onRecordRemoved);
    this.appComponent.popAppBarInfo();
  }


  loadMoreRows({ startIndex, stopIndex }) {

      let batchSize = stopIndex - startIndex + 1;

      console.log(`Request to load rows ${startIndex} thru ${stopIndex} (batch size == ${batchSize}`);

      if (this.state.dataIsLoading) {
        console.log('Data already loading! ignoring...');
        return;
      }

      let self = this;

      self.setState({dataIsLoading: true});

      return self.props.dao.find({ query: { 
                                            $limit: batchSize, 
                                            $skip: self.state.list.length 
                                          }
                                  })
      // return new Promise(function(resolve, reject) {

      //     // Simulate a data call...
      //     if (self.state.list.length <= 52) {
      //       window.setTimeout(function() {
      //           console.log('Loading mock records...');
      //           let mockDataPage = [];
      //           let baseCount = self.state.list.length;
      //           for (let i = 1; i <= batchSize; i++) {
      //             let mockRecord = self.props.dao.schema.getMockData();
      //             mockRecord._id = (baseCount + i).toString();
      //             mockRecord.lastName = mockRecord.lastName + '-' + (startIndex + i);
      //             mockDataPage.push(mockRecord);
      //           } // for
      //           resolve(mockDataPage);
      //       }, 2000);
      //     }
      //     else {
      //       // We are out of paged records...
      //       window.setTimeout(function() {
      //          resolve([]);
      //       }, 2000);
      //     }
      // })

      .then(
        function (result) {
          let dataPage = result.data;
          console.log(`Loading ${dataPage.length} paged records for rows ${startIndex} thru ${stopIndex}.`);

          // Convert the records so data types match up...
          let updatedList = self.state.list.slice(0);
          dataPage.forEach(function(record) {
              updatedList.push(self.props.dao.schema.convert(record));
          });
          self.setState({ list: updatedList, dataIsLoading: false, remoteRowCount: dataPage.length >= batchSize ? UNKNOWN_ROW_COUNT : updatedList.length });
        })

      .catch(function(error) {
          console.log('Error!' + error);
          self.setState({ dataIsLoading: false });
      });

  }


  componentDidMount() {
    this.loadMoreRows({ startIndex: 0, stopIndex: 19 });
  }



  onEditRecord(indexToEdit) {
     this.setState({ editIndex: indexToEdit });
  }


  onAddNewRecord() {
     this.setState({ editIndex: -1 });
  }


  onListScroll({ scrollTop }) {
    this.lastScrollTop = scrollTop
  }


  onFormSubmit(formData) {
     let self = this;
     let editIndex = this.state.editIndex;
     if (editIndex >= 0) {
        // Save existing record...
        let oldRecord = this.state.list[editIndex];
        this.props.dao.patch(oldRecord._id, formData).then(record => self.onRecordUpdated(record));
     }
     else {
        // Create a new record...
        this.props.dao.create(formData).then(record => self.onRecordCreated(record));
     }
     this.setState({ editIndex: -2 });
  }


  onFormCancel(resetForm) {
     this.lastSavedIndex = -1;
     this.setState({ editIndex: -2 });
  }


  onFormRemove(resetForm) {
     let self = this;
     let editIndex = this.state.editIndex;
     let oldRecord = this.state.list[editIndex];
     this.props.dao.remove(oldRecord._id).then(record => self.onRecordRemoved(record));
     this.lastSavedIndex = -1;
     this.setState({ editIndex: -2 });
  }



  onRecordCreated(newRecord) {
    console.log(`onRecordCreated(${JSON.stringify(newRecord)})`);
      let updatedList = this.state.list.slice(0);
      updatedList.push(this.props.dao.schema.convert(newRecord));
      this.lastSavedIndex = updatedList.length - 1;
      let newRowCount = this.state.remoteRowCount;
      if (newRowCount < updatedList.length) {
        newRowCount = updatedList.length;
      }
      this.setState({ list: updatedList, remoteRowCount: newRowCount });
  }


  getIndexOfId(id) {
    for (let i = 0; i < this.state.list.length; i++) {
      if (this.state.list[i]._id === id) {
        return i;
      }
    }
    return -1;
  }


  onRecordUpdated(record) {
    console.log(`onRecordUpdated(${JSON.stringify(record)})`);

    let editIndex = this.getIndexOfId(record._id);
    if (editIndex >= 0) {
      let updatedList = this.state.list.slice(0);
      updatedList[editIndex] = this.props.dao.schema.convert(record);
      this.setState({ list: updatedList });
    }
    else {
      console.log("WARNING - could not locate record id " + record._id);
      this.onRecordCreated(record);
    }
  }


  onRecordRemoved(record) {
    console.log(`onRecordRemoved(${JSON.stringify(record)})`);

    let editIndex = this.getIndexOfId(record._id);
    if (editIndex >= 0) {
      let updatedList = this.state.list.slice(0);
      updatedList.splice(editIndex, 1);
      this.setState({ list: updatedList, remoteRowCount: this.state.remoteRowCount != UNKNOWN_ROW_COUNT ? updatedList.length : UNKNOWN_ROW_COUNT });
    }
    else {
      console.log("WARNING - could not locate and remove record id " + record._id);
    }
  }


  renderCurrentPage() {

    const RecordEditor = this.RecordEditor;

    if (this.state.editIndex <= -2) {

         let scrollTop, revealIndex;
         if (this.lastSavedIndex >= 0) {
            revealIndex = this.lastSavedIndex;
            this.lastSavedIndex = -1;
            // Leave scrollTop as "undefined"
         }
         else {
            scrollTop = this.lastScrollTop;
            // leave revealIndex as "undefined"
         }

         return (
          <CrudList
              onLoadMoreRows={this.loadMoreRows.bind(this)}
              onEditRecord={this.onEditRecord.bind(this)}
              onAddNewRecord={this.onAddNewRecord.bind(this)}
              onScroll={this.onListScroll.bind(this)}
              recordList={this.state.list}
              containerWidth={this.props.containerWidth}
              containerHeight={this.props.containerHeight}
              totalRowCount={this.state.remoteRowCount}
              scrollTop= { scrollTop }
              scrollToIndex={ revealIndex }
              className="crud-list"
              key="crud_list"
          />
        );
    }
    else {
        let calculatedWidth = this.props.containerWidth > 600 ? 600 : this.props.containerWidth - 30;
        let submitName, removeName, currentRecord;

        if (this.state.editIndex == -1) {
          currentRecord = this.props.dao.schema.getDefaultRecord(true);
          submitName = 'Create';
        }
        else {
          currentRecord = this.state.list[this.state.editIndex];
          submitName = 'Save';
          removeName = 'Remove';
        }

        return (
           <RecordEditor
               submitButtonName={submitName}
               onSubmit={this.onFormSubmit.bind(this)}
               cancelButtonName='Cancel'
               onCancel={this.onFormCancel.bind(this)}
               removeButtonName={removeName}
               onRemove={this.onFormRemove.bind(this)}
               defaultValues={currentRecord}
               className="crud-form"
               style={{ width: calculatedWidth + 'px' }}
               key="crud_editor"
           />
        )
    }
  }


  render() {
     console.log(`Render request: remoteRowCount: ${this.state.remoteRowCount}, list length: ${this.state.list.length}`);

     return (
      <ReactCSSTransitionGroup
         transitionName="crud"
         transitionAppear={true}
         transitionAppearTimeout={500}
         transitionEnterTimeout={500}
         transitionLeaveTimeout={500}>
         {this.renderCurrentPage()}
      </ReactCSSTransitionGroup>
     );
  }

}


CrudPage.propTypes = {
  pageTitle: React.PropTypes.string,
  dao: React.PropTypes.object,
  appComponent: React.PropTypes.object
}


export default Dimensions()(CrudPage);
