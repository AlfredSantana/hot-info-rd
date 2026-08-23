import { useParams } from 'react-router-dom'
import ArticleForm from './ArticleForm.jsx'

export default function EditArticle() {
  const { id } = useParams()
  return <ArticleForm articleId={id} />
}