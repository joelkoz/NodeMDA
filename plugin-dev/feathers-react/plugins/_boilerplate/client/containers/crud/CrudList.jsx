
import React from 'react';
import { InfiniteLoader, List as VirtualizedList } from 'react-virtualized';
import { ListItem } from 'material-ui/List';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

class CrudList extends React.Component {

  constructor() {
    super();
  }


  renderRow({ key,         // Unique key within array of rows
              index,       // Index of row within collection
              isScrolling, // The List is currently being scrolled
              isVisible,   // This row is visible within the List (eg it is not an overscanned row)
              style        // Style object to be applied to row (to position it)
            }) {
          let item = this.props.recordList[index];
          let self = this;
          return (
            <ListItem 
                primaryText={self.props.getPrimaryText(item)}
                secondaryText={self.props.getSecondaryText(item)}
                key={key}
                onClick={self.editListItem(index)} 
                style={style}
                innerDivStyle={{ overflowY: 'hidden', padding: '8px 5px 5px' }} />            
          );
  }


  editListItem(index) {
    let self = this;
    let indexToEdit = index;
    return function() {
      self.props.onEditRecord(indexToEdit);
    }
  }


  isRowLoaded({ index }) {
     let rowLoaded = !!this.props.recordList[index];
     return rowLoaded;
  }


  render() {

    const styleAddButton = {
      marginRight: '15px',
      float: 'right'
    };

    let listWidth = this.props.containerWidth - 15;

    let listHeight = this.props.containerHeight;

    // Make room for the bottom button plus a little margin
    listHeight -= 60;

    const rowHeight = 50;
    const maxDisplayRows = Math.floor(listHeight / rowHeight);

    // adjust list height to display complete rows...
    listHeight =  maxDisplayRows * rowHeight;

     return (
      <div className={this.props.className}>
          <InfiniteLoader
              isRowLoaded={this.isRowLoaded.bind(this)}
              loadMoreRows={this.props.onLoadMoreRows}
              rowCount={ this.props.totalRowCount }
              minimumBatchSize={maxDisplayRows * 4}
              threshold={maxDisplayRows}
          >
          {({ onRowsRendered, registerChild }) => (
            <VirtualizedList
                height={listHeight} 
                onRowsRendered={onRowsRendered}
                ref={registerChild}
                rowCount={this.props.recordList.length}
                rowHeight={rowHeight}
                rowRenderer={this.renderRow.bind(this)}
                width={listWidth}
                onScroll={ this.props.onScroll }
                scrollTop= { this.props.scrollTop }
                scrollToIndex={ this.props.scrollToIndex }
                noRowsRenderer={ () => { return (<ListItem primaryText={'List is empty'}/>) }}
            />
           )}
          </InfiniteLoader>

          <FloatingActionButton mini={true} style={styleAddButton} onTouchTap={this.props.onAddNewRecord}>
             <ContentAdd />
          </FloatingActionButton>
      </div>
    );


  }
}

CrudList.propTypes = {
  getPrimaryText: React.PropTypes.func.isRequired,
  getSecondaryText: React.PropTypes.func.isRequired,
  onLoadMoreRows: React.PropTypes.func,
  onEditRecord: React.PropTypes.func.isRequired,
  onAddNewRecord: React.PropTypes.func.isRequired,
  onScroll: React.PropTypes.func.isRequired,
  recordList: React.PropTypes.array.isRequired,
  containerWidth: React.PropTypes.number.isRequired,
  containerHeight: React.PropTypes.number.isRequired,
  totalRowCount: React.PropTypes.number.isRequired,
  scrollToIndex: React.PropTypes.number,
  scrollTop: React.PropTypes.number,
};

export default CrudList;
