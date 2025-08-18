import { useState } from 'react';
import PropTypes from 'prop-types';
import { Edit2, RotateCcw, Sparkles, Check } from 'lucide-react';

const ToggleSwitch = ({ isOn, handleToggle }) => (
  <div
    onClick={handleToggle}
    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 cursor-pointer ${isOn ? 'bg-[#837BFF]' : 'bg-gray-300'
      }`}
  >
    <span
      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${isOn ? 'translate-x-6' : 'translate-x-1'
        }`}
    />
  </div>
);

ToggleSwitch.propTypes = {
  isOn: PropTypes.bool.isRequired,
  handleToggle: PropTypes.func.isRequired,
};

const DragDots = () => (
  <div className="flex flex-col items-center justify-center cursor-move text-gray-400 hover:text-gray-600 gap-0.5">
    <div className="flex gap-0.5">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="w-1 h-1 bg-current rounded-full"></div>
      ))}
    </div>
    <div className="flex gap-0.5">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="w-1 h-1 bg-current rounded-full"></div>
      ))}
    </div>
  </div>
);

const FeedbackPanel = () => {
  const [useCases, setUseCases] = useState({
    'General Query': true,
    'New Consultation': true,
    'Opinion Consultation': true,
    'Existing Consultation Follow-up': true,
  });

  const [selectedUseCase, setSelectedUseCase] = useState('');
  const [afterXHours, setAfterXHours] = useState('');
  const [xHours, setXHours] = useState(5);
  const [feedbackPurpose, setFeedbackPurpose] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(5);

  const [questions, setQuestions] = useState([
    'How satisfied are you with the overall consultation experience?',
    'How would you rate the clarity of the doctors explanations?',
    'How well did the doctor address your concerns or questions?',
    'How satisfied are you with the response time from the clinic?',
    'How likely are you to recommend our services to others?',
  ]);

  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState('');

  const handleToggle = (useCase) => {
    setUseCases((prev) => ({ ...prev, [useCase]: !prev[useCase] }));
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditingText(questions[index]);
  };

  const handleSave = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = editingText;
    setQuestions(updatedQuestions);
    setEditingIndex(null);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') handleSave(index);
    else if (e.key === 'Escape') setEditingIndex(null);
  };

  return (
    <div className="bg-gray-50 mt-10">
      <div className="border rounded-xl shadow-lg bg-white p-6 space-y-8">

        <h2 className="text-xl font-bold text-gray-800">Feedback Panel</h2>


        <div className="border rounded-lg shadow-sm bg-white">
          <div className="bg-[#837BFF] text-white font-bold p-3 rounded-t-lg flex justify-between items-center text-base">
            <span className="font-bold text-base">Messenger Use Case</span>
            <span className="font-bold text-base">On / Off</span>
          </div>
          <div className="divide-y divide-gray-200">
            {Object.entries(useCases).map(([useCase, isOn]) => (
              <div
                key={useCase}
                className="flex justify-between items-center p-4"
              >
                <span className="text-gray-700 font-semibold text-sm">
                  {useCase}
                </span>
                <ToggleSwitch
                  isOn={isOn}
                  handleToggle={() => handleToggle(useCase)}
                />
              </div>
            ))}
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-1 border rounded-lg shadow-sm bg-white p-6 space-y-5">
            <select
              value={selectedUseCase}
              onChange={(e) => setSelectedUseCase(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white font-bold text-sm"
            >
              <option value="">Select Messenger Use Case</option>
              <option value="General Query">General Query</option>
              <option value="New Consultation">New Consultation</option>
              <option value="Opinion Consultation">Opinion Consultation</option>
              <option value="Existing Consultation Follow-up">
                Existing Consultation Follow-up
              </option>
            </select>

            <select
              value={afterXHours}
              onChange={(e) => setAfterXHours(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white font-bold text-sm"
            >
              <option value="">After X hours </option>
              <option value="immediate">Immediate after closure</option>
              {[1, 2, 3, 4].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'hour' : 'hours'}
                </option>
              ))}
            </select>


            <div className="flex items-center space-x-4">
              <label className="text-sm font-bold text-gray-700 w-32">
                X hours
              </label>
              <select
                value={xHours}
                onChange={(e) => setXHours(Number(e.target.value))}
                className="flex-1 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white font-bold text-sm"
              >
                {[...Array(24).keys()].map((i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              value={feedbackPurpose}
              onChange={(e) => setFeedbackPurpose(e.target.value)}
              placeholder="Feedback Purpose"
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-semibold text-sm"
            />

            <div className="flex items-center space-x-4">
              <label className="text-sm font-bold text-gray-700 w-32">
                Total Questions
              </label>
              <select
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                className="flex-1 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white font-bold text-sm"
              >
                {[...Array(10).keys()].map((i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end">
              <button className="bg-yellow-400 text-white font-bold py-3 px-6 rounded-md hover:bg-yellow-500 transition-colors flex items-center gap-2 shadow-sm text-sm">
                <Sparkles className="w-4 h-3 text-white" />
                Generate Questions
              </button>
            </div>
          </div>


          <div className="lg:col-span-2 border rounded-lg bg-white">
            <div className="bg-[#837BFF] text-white p-3 rounded-t-lg flex justify-between items-center">
              <span className="font-bold text-base">Feedback Name</span>
              <span className="font-bold text-base">Edit / Recreate</span>
            </div>
            <div className="divide-y divide-gray-200">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                >
                  <DragDots />
                  <div className="flex-1">
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="w-full border border-gray-300 rounded-md p-2 text-sm font-semibold focus:ring-indigo-500 focus:border-indigo-500"
                        autoFocus
                      />
                    ) : (
                      <span className="text-gray-800 text-sm font-semibold">
                        <span className="font-bold text-gray-600">
                          Q{index + 1}:
                        </span>{' '}
                        {question}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {editingIndex === index ? (
                        <button
                            onClick={() => handleSave(index)}
                            className="text-gray-500 hover:text-green-600 transition-colors"
                        >
                            <Check size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={() => handleEditClick(index)}
                            className="text-gray-500 hover:text-indigo-600 transition-colors"
                        >
                            <Edit2 size={18} />
                        </button>
                    )}
                    <button className="text-gray-500 hover:text-green-600 transition-colors mr-10">
                      <RotateCcw size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPanel;
