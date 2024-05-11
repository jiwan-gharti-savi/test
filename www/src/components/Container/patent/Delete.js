import React from 'react';

// Child component
class ChildComponent extends React.Component {
  componentDidMount() {
    // Fetch the data from the API
    // For demonstration purposes, I'm using a mock fetch with a setTimeout
    setTimeout(() => {
      const fetchedData = [
        { content: 'Dynamic Section 1' },
        { content: 'Dynamic Section 2' },
        // ... Add as many sections as you want
      ];
      const sectionRefs = fetchedData.map(() => React.createRef());
      this.props.onDataFetched(fetchedData, sectionRefs);
    }, 1000);
  }

  render() {
    const { data, sectionRefs } = this.props;
    return (
      <div>
        {data.map((section, index) => (
          <div key={index} ref={sectionRefs[index]}>
            {section.content}
          </div>
        ))}
      </div>
    );
  }
}

// Parent component
class ParentComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sections: [],
      sectionRefs: [],
    };
  }

  handleDataFetched = (data, refs) => {
    this.setState({ sections: data, sectionRefs: refs });
  };

  scrollTo = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  };

  render() {
    const { sections, sectionRefs } = this.state;
    return (
      <div>
        {sectionRefs.map((ref, index) => (
          <button key={index} onClick={() => this.scrollTo(ref)}>
            Go to Dynamic Section {index + 1}
          </button>
        ))}

        <ChildComponent data={sections} sectionRefs={sectionRefs} onDataFetched={this.handleDataFetched} />
      </div>
    );
  }
}

export default ParentComponent;
