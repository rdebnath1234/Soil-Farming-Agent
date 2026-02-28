import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/useAuth';

const INITIAL_MANDI_FILTERS = {
  state: 'West Bengal',
  district: '',
  market: '',
  commodity: 'Potato',
  arrivalDate: '',
  limit: 15,
};

function SoilForm({ onCreated }) {
  const [formData, setFormData] = useState({
    soilType: '',
    phRange: '',
    suitableCrops: '',
    nutrients: '',
    irrigationTips: '',
  });

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/soils', formData);
    setFormData({
      soilType: '',
      phRange: '',
      suitableCrops: '',
      nutrients: '',
      irrigationTips: '',
    });
    onCreated();
  };

  return (
    <form onSubmit={submit} className="card form-grid reveal-block">
      <h3>Post Soil Details</h3>
      <input
        name="soilType"
        placeholder="Soil Type (e.g., Sand)"
        value={formData.soilType}
        onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
        required
      />
      <input
        name="phRange"
        placeholder="pH Range"
        value={formData.phRange}
        onChange={(e) => setFormData({ ...formData, phRange: e.target.value })}
        required
      />
      <input
        name="suitableCrops"
        placeholder="Suitable Crops"
        value={formData.suitableCrops}
        onChange={(e) =>
          setFormData({ ...formData, suitableCrops: e.target.value })
        }
        required
      />
      <input
        name="nutrients"
        placeholder="Nutrients"
        value={formData.nutrients}
        onChange={(e) => setFormData({ ...formData, nutrients: e.target.value })}
        required
      />
      <textarea
        name="irrigationTips"
        placeholder="Irrigation Tips"
        value={formData.irrigationTips}
        onChange={(e) =>
          setFormData({ ...formData, irrigationTips: e.target.value })
        }
        required
      />
      <button type="submit">Save Soil Details</button>
    </form>
  );
}

function DistributorForm({ onCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    seedsAvailable: '',
  });

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/distributors', formData);
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      seedsAvailable: '',
    });
    onCreated();
  };

  return (
    <form onSubmit={submit} className="card form-grid reveal-block">
      <h3>Post Distributor Details</h3>
      <input
        name="name"
        placeholder="Distributor Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <input
        name="contactPerson"
        placeholder="Contact Person"
        value={formData.contactPerson}
        onChange={(e) =>
          setFormData({ ...formData, contactPerson: e.target.value })
        }
        required
      />
      <input
        name="phone"
        placeholder="Phone"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        required
      />
      <input
        name="email"
        placeholder="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <input
        name="address"
        placeholder="Address"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        required
      />
      <textarea
        name="seedsAvailable"
        placeholder="Seeds Available"
        value={formData.seedsAvailable}
        onChange={(e) =>
          setFormData({ ...formData, seedsAvailable: e.target.value })
        }
        required
      />
      <button type="submit">Save Distributor</button>
    </form>
  );
}

function SoilCard({ soil, isAdmin, onDelete, onUpdate, index }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    soilType: soil.soilType,
    phRange: soil.phRange,
    suitableCrops: soil.suitableCrops,
    nutrients: soil.nutrients,
    irrigationTips: soil.irrigationTips,
  });

  const save = async (e) => {
    e.preventDefault();
    await onUpdate(soil._id, formData);
    setEditing(false);
  };

  return (
    <article className="list-card" style={{ '--i': index }}>
      {editing ? (
        <form className="form-grid compact-form" onSubmit={save}>
          <input
            name="soilType"
            value={formData.soilType}
            onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
            required
          />
          <input
            name="phRange"
            value={formData.phRange}
            onChange={(e) => setFormData({ ...formData, phRange: e.target.value })}
            required
          />
          <input
            name="suitableCrops"
            value={formData.suitableCrops}
            onChange={(e) =>
              setFormData({ ...formData, suitableCrops: e.target.value })
            }
            required
          />
          <input
            name="nutrients"
            value={formData.nutrients}
            onChange={(e) => setFormData({ ...formData, nutrients: e.target.value })}
            required
          />
          <textarea
            name="irrigationTips"
            value={formData.irrigationTips}
            onChange={(e) =>
              setFormData({ ...formData, irrigationTips: e.target.value })
            }
            required
          />
          <div className="actions-row">
            <button type="submit">Save</button>
            <button
              className="btn-secondary"
              type="button"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <h3>{soil.soilType}</h3>
          <p>
            <strong>pH:</strong> {soil.phRange}
          </p>
          <p>
            <strong>Crops:</strong> {soil.suitableCrops}
          </p>
          <p>
            <strong>Nutrients:</strong> {soil.nutrients}
          </p>
          <p>
            <strong>Irrigation:</strong> {soil.irrigationTips}
          </p>
          {isAdmin ? (
            <div className="actions-row">
              <button type="button" onClick={() => setEditing(true)}>
                Edit
              </button>
              <button
                className="btn-danger"
                type="button"
                onClick={() => onDelete(soil._id)}
              >
                Delete
              </button>
            </div>
          ) : null}
        </>
      )}
    </article>
  );
}

function DistributorCard({ distributor, isAdmin, onDelete, onUpdate, index }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: distributor.name,
    contactPerson: distributor.contactPerson,
    phone: distributor.phone,
    email: distributor.email,
    address: distributor.address,
    seedsAvailable: distributor.seedsAvailable,
  });

  const save = async (e) => {
    e.preventDefault();
    await onUpdate(distributor._id, formData);
    setEditing(false);
  };

  return (
    <article className="list-card" style={{ '--i': index }}>
      {editing ? (
        <form className="form-grid compact-form" onSubmit={save}>
          <input
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            name="contactPerson"
            value={formData.contactPerson}
            onChange={(e) =>
              setFormData({ ...formData, contactPerson: e.target.value })
            }
            required
          />
          <input
            name="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            name="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
          <textarea
            name="seedsAvailable"
            value={formData.seedsAvailable}
            onChange={(e) =>
              setFormData({ ...formData, seedsAvailable: e.target.value })
            }
            required
          />
          <div className="actions-row">
            <button type="submit">Save</button>
            <button
              className="btn-secondary"
              type="button"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <h3>{distributor.name}</h3>
          <p>
            <strong>Contact:</strong> {distributor.contactPerson}
          </p>
          <p>
            <strong>Phone:</strong> {distributor.phone}
          </p>
          <p>
            <strong>Email:</strong> {distributor.email}
          </p>
          <p>
            <strong>Address:</strong> {distributor.address}
          </p>
          <p>
            <strong>Seeds:</strong> {distributor.seedsAvailable}
          </p>
          {isAdmin ? (
            <div className="actions-row">
              <button type="button" onClick={() => setEditing(true)}>
                Edit
              </button>
              <button
                className="btn-danger"
                type="button"
                onClick={() => onDelete(distributor._id)}
              >
                Delete
              </button>
            </div>
          ) : null}
        </>
      )}
    </article>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="pagination-row">
      <button
        type="button"
        className="btn-secondary"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className="btn-secondary"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}

function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ask = async (e) => {
    e.preventDefault();
    const userQuestion = question.trim();
    if (!userQuestion) {
      return;
    }

    setLoading(true);
    setError('');
    setMessages((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        role: 'user',
        text: userQuestion,
      },
    ]);
    setQuestion('');

    try {
      const { data } = await api.post('/ai/ask', {
        question: userQuestion,
        answerLanguage: 'bn',
        topK: 4,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: data.answer || 'এই প্রশ্নের জন্য উত্তর পাওয়া যায়নি।',
          references: data.references || [],
        },
      ]);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'AI উত্তর পাওয়া যায়নি';
      setError(errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          text: errorMessage,
          isError: true,
          references: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="ai-launcher"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? 'Close AI' : 'AI Assistant'}
      </button>

      {isOpen ? (
        <section className="ai-popup" role="dialog" aria-label="Bengali AI Assistant">
          <div className="ai-popup-header">
            <div>
              <h2>Bengali AI Assistant</h2>
              <p>RAG ভিত্তিক context-aware উত্তর</p>
            </div>
            <button
              type="button"
              className="ai-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close AI assistant"
            >
              x
            </button>
          </div>

          <div className="ai-popup-body">
            {!messages.length ? (
              <p className="ai-empty">
                বাংলায় প্রশ্ন লিখুন। উদাহরণ: দোআঁশ মাটিতে কোন ফসল ভালো?
              </p>
            ) : null}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`ai-message ${message.role} ${message.isError ? 'error' : ''}`}
              >
                <p>{message.text}</p>
                {message.references?.length ? (
                  <div className="ai-references">
                    {message.references.map((ref, index) => (
                      <p key={ref.id || `${ref.title}-${index}`}>
                        <strong>{index + 1}. {ref.title}</strong>
                        {ref.source ? ` (${ref.source})` : ''}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <form className="ai-form" onSubmit={ask}>
            <textarea
              name="aiQuestion"
              placeholder="বাংলায় প্রশ্ন লিখুন..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'উত্তর তৈরি হচ্ছে...' : 'Send'}
            </button>
          </form>

          {error ? <p className="error">{error}</p> : null}
        </section>
      ) : null}
    </>
  );
}

function MandiPriceBoard({ isAdmin }) {
  const [filters, setFilters] = useState(INITIAL_MANDI_FILTERS);
  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState({
    count: 0,
    updatedDate: '',
    lastFetchedAt: '',
    synced: 0,
    syncedAt: '',
  });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  const loadMandiPrices = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get('/agmarknet/prices', { params: filters });
      setRecords(data.records || []);
      setMeta((prev) => ({
        ...prev,
        count: data.count || 0,
        updatedDate: data.updatedDate || '',
        lastFetchedAt: new Date().toISOString(),
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Mandi price data load failed');
    } finally {
      setLoading(false);
    }
  };

  const syncMandiPrices = async () => {
    setSyncing(true);
    setError('');

    try {
      const { data } = await api.post('/agmarknet/sync', null, {
        params: filters,
      });
      setMeta((prev) => ({
        ...prev,
        synced: data.synced || 0,
        syncedAt: data.syncedAt || '',
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Mandi sync failed');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const loadInitialMandiPrices = async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await api.get('/agmarknet/prices', {
          params: INITIAL_MANDI_FILTERS,
        });
        if (!isActive) {
          return;
        }

        setRecords(data.records || []);
        setMeta((prev) => ({
          ...prev,
          count: data.count || 0,
          updatedDate: data.updatedDate || '',
          lastFetchedAt: new Date().toISOString(),
        }));
      } catch (err) {
        if (isActive) {
          setError(err.response?.data?.message || 'Mandi price data load failed');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadInitialMandiPrices();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="mandi-shell reveal-block">
      <div className="mandi-header">
        <div>
          <p className="eyebrow">India Market Feed</p>
          <h2>Live Mandi Prices (Agmarknet)</h2>
        </div>
        <div className="mandi-actions">
          <button type="button" className="btn-secondary" onClick={loadMandiPrices} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Live'}
          </button>
          {isAdmin ? (
            <button type="button" onClick={syncMandiPrices} disabled={syncing}>
              {syncing ? 'Syncing...' : 'Sync to DB'}
            </button>
          ) : null}
        </div>
      </div>

      <div className="mandi-filters">
        <input
          id="mandi-state"
          name="mandiState"
          placeholder="State"
          value={filters.state}
          onChange={(e) => setFilters({ ...filters, state: e.target.value })}
        />
        <input
          id="mandi-district"
          name="mandiDistrict"
          placeholder="District"
          value={filters.district}
          onChange={(e) => setFilters({ ...filters, district: e.target.value })}
        />
        <input
          id="mandi-market"
          name="mandiMarket"
          placeholder="Market"
          value={filters.market}
          onChange={(e) => setFilters({ ...filters, market: e.target.value })}
        />
        <input
          id="mandi-commodity"
          name="mandiCommodity"
          placeholder="Commodity"
          value={filters.commodity}
          onChange={(e) => setFilters({ ...filters, commodity: e.target.value })}
        />
        <input
          id="mandi-arrival-date"
          name="mandiArrivalDate"
          placeholder="Arrival Date (DD/MM/YYYY)"
          value={filters.arrivalDate}
          onChange={(e) => setFilters({ ...filters, arrivalDate: e.target.value })}
        />
      </div>

      <div className="mandi-metrics">
        <p>
          Showing <strong>{meta.count}</strong> rows
        </p>
        <p>
          Updated at: <strong>{meta.updatedDate || 'N/A'}</strong>
        </p>
        {meta.lastFetchedAt ? (
          <p>
            Last fetched: <strong>{new Date(meta.lastFetchedAt).toLocaleString()}</strong>
          </p>
        ) : null}
        {isAdmin && meta.syncedAt ? (
          <p>
            Synced <strong>{meta.synced}</strong> rows at{' '}
            <strong>{new Date(meta.syncedAt).toLocaleString()}</strong>
          </p>
        ) : null}
      </div>

      {error ? <p className="error">{error}</p> : null}

      <div className="mandi-table-wrap">
        <table className="mandi-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>State</th>
              <th>District</th>
              <th>Market</th>
              <th>Commodity</th>
              <th>Variety</th>
              <th>Min</th>
              <th>Max</th>
              <th>Modal</th>
            </tr>
          </thead>
          <tbody>
            {!records.length ? (
              <tr>
                <td colSpan={9}>No mandi price records found for current filters.</td>
              </tr>
            ) : (
              records.map((record, index) => (
                <tr key={`${record.market}-${record.commodity}-${record.arrivalDate}-${index}`}>
                  <td>{record.arrivalDate}</td>
                  <td>{record.state}</td>
                  <td>{record.district}</td>
                  <td>{record.market}</td>
                  <td>{record.commodity}</td>
                  <td>{record.variety || '-'}</td>
                  <td>{record.minPrice}</td>
                  <td>{record.maxPrice}</td>
                  <td>{record.modalPrice}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PincodeAdvisoryBoard() {
  const [pincode, setPincode] = useState('742101');
  const [advisory, setAdvisory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAdvice = async (e) => {
    e.preventDefault();
    const normalized = pincode.trim();
    if (!/^\d{6}$/.test(normalized)) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/advice', {
        params: { pincode: normalized },
      });
      setAdvisory(data);
    } catch (err) {
      setAdvisory(null);
      setError(err.response?.data?.message || 'Failed to fetch advisory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="advice-shell reveal-block">
      <div className="advice-head">
        <div>
          <p className="eyebrow">Smart Advisory</p>
          <h2>Pincode-based Soil + Mandi Advisory</h2>
        </div>
        <form className="advice-form" onSubmit={fetchAdvice}>
          <input
            id="advice-pincode"
            name="advicePincode"
            placeholder="Enter 6-digit pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            maxLength={6}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Checking...' : 'Get Advice'}
          </button>
        </form>
      </div>

      {error ? <p className="error">{error}</p> : null}

      {advisory ? (
        <div className="advice-result">
          <div className="advice-location card">
            <h3>Location</h3>
            <p>
              <strong>Pincode:</strong> {advisory.location?.pincode}
            </p>
            <p>
              <strong>State:</strong> {advisory.location?.state}
            </p>
            <p>
              <strong>District:</strong> {advisory.location?.district}
            </p>
            <p>
              <strong>Lat/Lon:</strong> {advisory.location?.lat}, {advisory.location?.lon}
            </p>
          </div>

          <div className="advice-soil card">
            <h3>Soil Profile</h3>
            <div className="soil-metrics">
              <p>
                <strong>pH:</strong> {advisory.soil?.ph ?? 'N/A'}
              </p>
              <p>
                <strong>Clay %:</strong> {advisory.soil?.clay ?? 'N/A'}
              </p>
              <p>
                <strong>Sand %:</strong> {advisory.soil?.sand ?? 'N/A'}
              </p>
              <p>
                <strong>Silt %:</strong> {advisory.soil?.silt ?? 'N/A'}
              </p>
              <p>
                <strong>SOC g/kg:</strong> {advisory.soil?.soc ?? 'N/A'}
              </p>
            </div>
          </div>

          <div className="advice-crops">
            {(advisory.recommendations || []).map((item, index) => (
              <article className="advice-crop-card" key={`${item.crop}-${index}`}>
                <div className="advice-crop-top">
                  <h3>{item.crop}</h3>
                  <p>{item.why_bn}</p>
                </div>
                <div className="advice-mandi-mini">
                  {!item.mandi_prices?.length ? (
                    <p className="advice-empty">No mandi prices available</p>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>Market</th>
                          <th>Min</th>
                          <th>Modal</th>
                          <th>Max</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.mandi_prices.map((price, rowIndex) => (
                          <tr key={`${price.market}-${price.date}-${rowIndex}`}>
                            <td>{price.market}</td>
                            <td>{price.min}</td>
                            <td>{price.modal}</td>
                            <td>{price.max}</td>
                            <td>{price.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [soilsData, setSoilsData] = useState({
    items: [],
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [distributorsData, setDistributorsData] = useState({
    items: [],
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');

  const [soilSearch, setSoilSearch] = useState('');
  const [soilPage, setSoilPage] = useState(1);
  const [distSearch, setDistSearch] = useState('');
  const [distPage, setDistPage] = useState(1);

  const isAdmin = user?.role === 'admin';
  const pageLimit = 6;

  const soilQuery = useMemo(
    () => ({ search: soilSearch, page: soilPage, limit: pageLimit }),
    [soilSearch, soilPage],
  );

  const distributorQuery = useMemo(
    () => ({ search: distSearch, page: distPage, limit: pageLimit }),
    [distSearch, distPage],
  );

  const loadSoils = async () => {
    const { data } = await api.get('/soils', { params: soilQuery });
    setSoilsData(data);
  };

  const loadDistributors = async () => {
    const { data } = await api.get('/distributors', { params: distributorQuery });
    setDistributorsData(data);
  };

  const loadLogs = async () => {
    if (!isAdmin) return;
    const { data } = await api.get('/logs');
    setLogs(data);
  };

  const loadData = async () => {
    try {
      setError('');
      await Promise.all([loadSoils(), loadDistributors(), loadLogs()]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    }
  };

  useEffect(() => {
    let isActive = true;

    const loadDashboardData = async () => {
      try {
        const requests = [
          api.get('/soils', { params: soilQuery }),
          api.get('/distributors', { params: distributorQuery }),
        ];

        if (isAdmin) {
          requests.push(api.get('/logs'));
        }

        const [soilsResponse, distributorsResponse, logsResponse] =
          await Promise.all(requests);

        if (!isActive) {
          return;
        }

        setError('');
        setSoilsData(soilsResponse.data);
        setDistributorsData(distributorsResponse.data);
        setLogs(isAdmin ? (logsResponse?.data ?? []) : []);
      } catch (err) {
        if (isActive) {
          setError(err.response?.data?.message || 'Failed to load dashboard data');
        }
      }
    };

    void loadDashboardData();

    return () => {
      isActive = false;
    };
  }, [distributorQuery, isAdmin, soilQuery]);

  const deleteSoil = async (id) => {
    await api.delete(`/soils/${id}`);
    await loadData();
  };

  const deleteDistributor = async (id) => {
    await api.delete(`/distributors/${id}`);
    await loadData();
  };

  const updateSoil = async (id, payload) => {
    await api.patch(`/soils/${id}`, payload);
    await loadData();
  };

  const updateDistributor = async (id, payload) => {
    await api.patch(`/distributors/${id}`, payload);
    await loadData();
  };

  return (
    <div className="dashboard">
      <header className="topbar card reveal-block">
        <div>
          <p className="eyebrow">Project Control Center</p>
          <h1>Soil Farming Agent</h1>
          <p>
            Logged in as <strong>{user?.name}</strong> ({user?.role})
          </p>
        </div>
        <button onClick={logout}>Logout</button>
      </header>

      {error ? <p className="error">{error}</p> : null}

      {isAdmin ? (
        <section className="grid-2">
          <SoilForm
            onCreated={async () => {
              setSoilPage(1);
              await loadData();
            }}
          />
          <DistributorForm
            onCreated={async () => {
              setDistPage(1);
              await loadData();
            }}
          />
        </section>
      ) : null}

      <PincodeAdvisoryBoard />
      <MandiPriceBoard isAdmin={isAdmin} />

      <section className="card reveal-block">
        <div className="section-header">
          <h2>Soil Details</h2>
          <input
            name="soilSearch"
            className="search-input"
            placeholder="Search soil, crops, nutrients..."
            value={soilSearch}
            onChange={(e) => {
              setSoilSearch(e.target.value);
              setSoilPage(1);
            }}
          />
        </div>

        <div className="list-grid">
          {soilsData.items.map((soil, index) => (
            <SoilCard
              key={soil._id}
              soil={soil}
              isAdmin={isAdmin}
              onDelete={deleteSoil}
              onUpdate={updateSoil}
              index={index}
            />
          ))}
        </div>

        <Pagination
          page={soilsData.page}
          totalPages={soilsData.totalPages}
          onPageChange={setSoilPage}
        />
      </section>

      <section className="card reveal-block">
        <div className="section-header">
          <h2>Distributor Details</h2>
          <input
            name="distributorSearch"
            className="search-input"
            placeholder="Search distributor, contact, seeds..."
            value={distSearch}
            onChange={(e) => {
              setDistSearch(e.target.value);
              setDistPage(1);
            }}
          />
        </div>

        <div className="list-grid">
          {distributorsData.items.map((distributor, index) => (
            <DistributorCard
              key={distributor._id}
              distributor={distributor}
              isAdmin={isAdmin}
              onDelete={deleteDistributor}
              onUpdate={updateDistributor}
              index={index}
            />
          ))}
        </div>

        <Pagination
          page={distributorsData.page}
          totalPages={distributorsData.totalPages}
          onPageChange={setDistPage}
        />
      </section>

      {isAdmin ? (
        <section className="card reveal-block">
          <h2>Activity Logs</h2>
          <div className="logs-wrap">
            {logs.map((log, index) => (
              <p key={log._id} style={{ '--i': index }}>
                <strong>{new Date(log.createdAt).toLocaleString()}:</strong>{' '}
                {log.message}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      <AiAssistant />
    </div>
  );
}
